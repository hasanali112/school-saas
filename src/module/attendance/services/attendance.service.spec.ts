import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { HolidaysFacade } from '@module/academics/services/holidays.facade';
import { SessionsFacade } from '@module/academics/services/sessions.facade';
import { TeachersFacade } from '@module/academics/services/teachers.facade';
import type { AuditSnapshot } from '@module/audit/domain/audit-entry';
import { AuditLogPort } from '@module/audit/application/ports/audit-log.port';
import type { AuthUser } from '@common/types/auth-user';
import { Role } from '@common/types/role';
import { EventPublisherPort } from '@module/events/application/ports/event-publisher.port';
import { LeaveFacade } from '@module/leave/services/leave.facade';
import type { RosterEntry } from '@module/students/domain/enrolment';
import { StudentStatus } from '@module/students/domain/student';
import { EnrolmentsFacade } from '@module/students/services/enrolments.facade';
import { ClockPort } from '@module/time/application/ports/clock.port';
import { UsersFacade } from '@module/users/services/users.facade';
import { createMock, getMock } from '@test/utils/create-mock';
import { containing } from '@test/utils/matchers';
import {
  AttendanceStatus,
  STIPEND_THRESHOLD_PERCENT,
} from '../domain/attendance';
import type { AttendanceRecord } from '../domain/attendance';
import { AttendanceMarkedEvent } from '../events/attendance-marked.event';
import { AttendanceRepository } from '../application/ports/attendance.repository.port';
import { AttendanceService } from './attendance.service';

const TODAY = '2026-03-10';
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
const entry = (n: number, nameEn: string): RosterEntry => ({
  enrolmentId: `e${n}`,
  studentId: `s${n}`,
  rollNo: n,
  admissionNo: `A-${n}`,
  nameBn: nameEn,
  nameEn,
  status: StudentStatus.Active,
});
const roster: RosterEntry[] = [entry(1, 'A'), entry(2, 'B')];
const record = (
  enrolmentId: string,
  date: string,
  status: AttendanceStatus,
): AttendanceRecord => ({
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
  let holidays: jest.Mocked<HolidaysFacade>;
  let teachers: jest.Mocked<TeachersFacade>;
  let leave: jest.Mocked<LeaveFacade>;
  let users: jest.Mocked<UsersFacade>;
  let audit: jest.Mocked<AuditLogPort>;
  let events: jest.Mocked<EventPublisherPort>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [AttendanceService],
    })
      .useMocker(createMock)
      .compile();
    service = moduleRef.get(AttendanceService);
    repo = getMock(moduleRef, AttendanceRepository);
    holidays = getMock(moduleRef, HolidaysFacade);
    teachers = getMock(moduleRef, TeachersFacade);
    leave = getMock(moduleRef, LeaveFacade);
    users = getMock(moduleRef, UsersFacade);
    audit = getMock(moduleRef, AuditLogPort);
    events = getMock(moduleRef, EventPublisherPort);
    getMock(moduleRef, SessionsFacade).resolveId.mockResolvedValue('sess');
    getMock(moduleRef, EnrolmentsFacade).rosterEntries.mockResolvedValue(
      roster,
    );
    getMock(moduleRef, ClockPort).today.mockReturnValue(TODAY);

    holidays.isHoliday.mockResolvedValue(false);
    leave.studentsOnApprovedLeave.mockResolvedValue(new Set());
    teachers.assignedSectionIds.mockResolvedValue(new Set(['sec-1']));
    repo.findRecords.mockResolvedValue([]);
    repo.upsertMany.mockImplementation((rows) =>
      Promise.resolve(
        rows.map((r, i): AttendanceRecord => ({
          ...r,
          id: `r${i}`,
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
    teachers.assignedSectionIds.mockResolvedValue(new Set(['other']));
    await expect(
      service.mark('sec-1', { date: TODAY, period: 0, entries }, teacher),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(teachers.assignedSectionIds).toHaveBeenCalledWith('teacher', 'sess');
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

    repo.findRecords.mockResolvedValue([
      record('e1', '2026-01-05', AttendanceStatus.Present),
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
        after: containing<AuditSnapshot>({ status: AttendanceStatus.Absent }),
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
    leave.studentsOnApprovedLeave.mockResolvedValue(new Set(['s1']));
    const result = await service.mark(
      'sec-1',
      { date: TODAY, period: 0, entries },
      teacher,
    );

    expect(leave.studentsOnApprovedLeave).toHaveBeenCalledWith(
      ['s1', 's2'],
      TODAY,
    );
    const [rows] = repo.upsertMany.mock.calls[0];
    expect(rows.find((r) => r.enrolmentId === 'e1')?.status).toBe(
      AttendanceStatus.Leave,
    );
    expect(result.counts).toEqual({ present: 0, absent: 1, late: 0, leave: 1 });
    expect(audit.record).not.toHaveBeenCalled();
    const [event] = events.publish.mock.calls[0];
    expect(event).toBeInstanceOf(AttendanceMarkedEvent);
    expect((event as AttendanceMarkedEvent).absentStudentIds).toEqual(['s2']);
  });

  it('sheet merges the roster with the marks of that date', async () => {
    repo.findRecords.mockResolvedValue([
      record('e2', TODAY, AttendanceStatus.Late),
    ]);
    const sheet = await service.sheet('sec-1', TODAY, 0, admin);
    expect(repo.findRecords).toHaveBeenCalledWith(['e1', 'e2'], TODAY, 0);
    expect(sheet.entries.map((e) => [e.rollNo, e.status])).toEqual([
      [1, null],
      [2, AttendanceStatus.Late],
    ]);
  });

  it('summary computes percentage over distinct working days and flags stipend eligibility', async () => {
    repo.findMonth.mockResolvedValue([
      record('e1', '2026-03-01', AttendanceStatus.Present),
      record('e1', '2026-03-02', AttendanceStatus.Late),
      record('e1', '2026-03-03', AttendanceStatus.Absent),
      record('e1', '2026-03-04', AttendanceStatus.Present),
      record('e2', '2026-03-01', AttendanceStatus.Absent),
      record('e2', '2026-03-02', AttendanceStatus.Absent),
      record('e2', '2026-03-03', AttendanceStatus.Present),
      // day 4 has no record for e2: still a working day for the section
    ]);

    const summary = await service.summary('sec-1', '2026-03', admin);

    expect(repo.findMonth).toHaveBeenCalledWith(
      'sec-1',
      'sess',
      '2026-03-01',
      '2026-03-31',
    );
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
      record('e1', '2026-03-02', AttendanceStatus.Present),
      record('e2', '2026-03-01', AttendanceStatus.Absent),
    ]);
    const register = await service.register('sec-1', '2026-03', admin);
    expect(register.workingDays).toEqual(['2026-03-01', '2026-03-02']);
    expect(register.rows[0].days).toEqual({
      '2026-03-02': AttendanceStatus.Present,
    });
    expect(register.rows[1].presentDays).toBe(0);
  });

  it('rejects a malformed month', async () => {
    await expect(
      service.summary('sec-1', '2026-3', admin),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('staff sheet lists every active staff member, unmarked ones as null', async () => {
    users.listActiveStaff.mockResolvedValue([
      { userId: 'u1', name: 'Asha' },
      { userId: 'u2', name: 'Babul' },
    ]);
    repo.findStaffMarks.mockResolvedValue([
      { userId: 'u2', status: AttendanceStatus.Late },
    ]);
    const sheet = await service.staffSheet(TODAY);
    expect(sheet.map((s) => [s.name, s.status])).toEqual([
      ['Asha', null],
      ['Babul', AttendanceStatus.Late],
    ]);
  });
});
