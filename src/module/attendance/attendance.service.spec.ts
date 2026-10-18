import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { todayLocal } from '@shared/time/local-date';
import { AuthUser } from '@modules/auth/auth-user';
import { Role } from '@modules/auth/roles';
import { AttendanceRecordRow } from '@database/schema';
import { HolidaysService } from '@modules/academics/holidays/holidays.service';
import { SessionsService } from '@modules/academics/sessions/sessions.service';
import { AuditService } from '@shared/audit/audit.service';
import type { AuditSnapshot } from '@shared/audit/audit.service';
import { DomainEvents } from '@shared/events/domain-events.service';
import { createMock, getMock } from '@test/utils/create-mock';
import { containing } from '@test/utils/matchers';
import { AttendanceRepository, RosterStatusRow } from './attendance.repository';
import {
  AttendanceService,
  STIPEND_THRESHOLD_PERCENT,
} from './attendance.service';
import { AttendanceStatus } from './dto/mark-attendance.dto';
import { AttendanceMarkedEvent } from './events/attendance-marked.event';

const admin: AuthUser = {
  id: 'admin',
  institutionId: 'inst-1',
  roles: [Role.AdminOfficer],
};
const teacher: AuthUser = {
  id: 'teacher',
  institutionId: 'inst-1',
  roles: [Role.SubjectTeacher],
};
const roster: RosterStatusRow[] = [
  {
    enrolmentId: 'e1',
    studentId: 's1',
    rollNo: 1,
    nameBn: 'ক',
    nameEn: 'A',
    status: null,
  },
  {
    enrolmentId: 'e2',
    studentId: 's2',
    rollNo: 2,
    nameBn: 'খ',
    nameEn: 'B',
    status: null,
  },
];
const TODAY = todayLocal();
const record = (
  enrolmentId: string,
  date: string,
  status: AttendanceRecordRow['status'],
): AttendanceRecordRow => ({
  id: `r-${enrolmentId}-${date}`,
  institutionId: 'inst-1',
  sessionId: 'sess-1',
  sectionId: 'sec-1',
  enrolmentId,
  studentId: enrolmentId.replace('e', 's'),
  date,
  period: 0,
  status,
  markedBy: 'teacher',
  markedAt: new Date('2026-01-01'),
  updatedBy: null,
  updatedAt: null,
});

describe('AttendanceService', () => {
  let service: AttendanceService;
  let repo: jest.Mocked<AttendanceRepository>;
  let holidays: jest.Mocked<HolidaysService>;
  let audit: jest.Mocked<AuditService>;
  let events: jest.Mocked<DomainEvents>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [AttendanceService],
    })
      .useMocker(createMock)
      .compile();
    service = moduleRef.get(AttendanceService);
    repo = getMock(moduleRef, AttendanceRepository);
    holidays = getMock(moduleRef, HolidaysService);
    audit = getMock(moduleRef, AuditService);
    events = getMock(moduleRef, DomainEvents);
    getMock(moduleRef, SessionsService).resolveId.mockResolvedValue('sess');

    holidays.isHoliday.mockResolvedValue(false);
    repo.findSheet.mockResolvedValue(roster);
    repo.findStudentsOnApprovedLeave.mockResolvedValue(new Set());
    repo.findAssignedSectionIds.mockResolvedValue(new Set(['sec-1']));
    repo.findExisting.mockResolvedValue([]);
    repo.upsertMany.mockImplementation((rows) =>
      Promise.resolve(
        rows.map((r, i): AttendanceRecordRow => ({
          ...r,
          id: `r${i}`,
          period: r.period ?? 0,
          markedAt: new Date(),
          updatedBy: null,
          updatedAt: null,
        })),
      ),
    );
    audit.record.mockResolvedValue();
  });

  const entries = [
    { enrolmentId: 'e1', status: AttendanceStatus.Present },
    { enrolmentId: 'e2', status: AttendanceStatus.Absent },
  ];

  it('refuses future dates and holidays', async () => {
    await expect(
      service.mark('sec-1', { date: '2999-01-01', period: 0, entries }, admin),
    ).rejects.toThrow('future');
    holidays.isHoliday.mockResolvedValue(true);
    await expect(
      service.mark('sec-1', { date: TODAY, period: 0, entries }, admin),
    ).rejects.toThrow('holiday');
    expect(repo.upsertMany).not.toHaveBeenCalled();
  });

  it('teachers may only mark sections they are assigned to', async () => {
    repo.findAssignedSectionIds.mockResolvedValue(new Set(['other']));
    await expect(
      service.mark('sec-1', { date: TODAY, period: 0, entries }, teacher),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('backdating is admin-only, needs a reason, and audits each changed record', async () => {
    await expect(
      service.mark(
        'sec-1',
        { date: '2026-01-05', period: 0, entries },
        teacher,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      service.mark('sec-1', { date: '2026-01-05', period: 0, entries }, admin),
    ).rejects.toThrow('reason');

    repo.findExisting.mockResolvedValue([
      record('e1', '2026-01-05', 'present'),
    ]); // e1 unchanged, e2 new
    const result = await service.mark(
      'sec-1',
      { date: '2026-01-05', period: 0, entries, reason: 'Register found' },
      admin,
    );

    expect(result.backdated).toBe(true);
    const [auditEntries] = audit.record.mock.calls[0];
    expect(auditEntries).toHaveLength(1);
    expect(auditEntries).toEqual([
      expect.objectContaining({
        action: 'attendance.backdated',
        reason: 'Register found',
        after: containing<AuditSnapshot>({ status: 'absent' }),
      }),
    ]);
  });

  it('rejects entries that are not on the section roster', async () => {
    await expect(
      service.mark(
        'sec-1',
        {
          date: TODAY,
          period: 0,
          entries: [
            { enrolmentId: 'stranger', status: AttendanceStatus.Present },
          ],
        },
        admin,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('approved leave overrides the marked status and absentees are published', async () => {
    repo.findStudentsOnApprovedLeave.mockResolvedValue(new Set(['s1']));
    const result = await service.mark(
      'sec-1',
      { date: TODAY, period: 0, entries },
      teacher,
    );

    const [rows] = repo.upsertMany.mock.calls[0];
    expect(rows.find((r) => r.enrolmentId === 'e1')?.status).toBe('leave');
    expect(result.counts).toEqual({ present: 0, absent: 1, late: 0, leave: 1 });
    expect(audit.record).not.toHaveBeenCalled();
    const [event] = events.publish.mock.calls[0];
    expect(event).toBeInstanceOf(AttendanceMarkedEvent);
    expect((event as AttendanceMarkedEvent).absentStudentIds).toEqual(['s2']);
  });

  it('summary computes percentage over distinct working days and flags stipend eligibility', async () => {
    repo.findMonth.mockResolvedValue([
      record('e1', '2026-03-01', 'present'),
      record('e1', '2026-03-02', 'late'),
      record('e1', '2026-03-03', 'absent'),
      record('e1', '2026-03-04', 'present'),
      record('e2', '2026-03-01', 'absent'),
      record('e2', '2026-03-02', 'absent'),
      record('e2', '2026-03-03', 'present'),
      // day 4 has no record for e2: still a working day for the section
    ]);

    const summary = await service.summary('sec-1', '2026-03', admin);

    expect(summary.workingDays).toBe(4);
    expect(summary.thresholdPercent).toBe(STIPEND_THRESHOLD_PERCENT);
    expect(
      summary.rows.map((r) => [
        r.rollNo,
        r.presentDays,
        r.percentage,
        r.stipendEligible,
      ]),
    ).toEqual([
      [1, 3, 75, true],
      [2, 1, 25, false],
    ]);
  });

  it('register lists working days and a date→status map per student', async () => {
    repo.findMonth.mockResolvedValue([
      record('e1', '2026-03-02', 'present'),
      record('e2', '2026-03-01', 'absent'),
    ]);
    const register = await service.register('sec-1', '2026-03', admin);
    expect(register.workingDays).toEqual(['2026-03-01', '2026-03-02']);
    expect(register.rows[0].days).toEqual({ '2026-03-02': 'present' });
    expect(register.rows[1].presentDays).toBe(0);
  });

  it('rejects a malformed month', async () => {
    await expect(
      service.summary('sec-1', '2026-3', admin),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
