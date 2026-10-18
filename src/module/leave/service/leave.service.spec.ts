import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthUser } from '@module/auth/domain/auth-user';
import { Role } from '@module/auth/domain/role';
import type { LeaveApplication, LeaveType } from '@module/leave/domain/leave';
import { ApplicantKind, LeaveAppliesTo, LeaveStatus } from '../domain/leave';
import { AuditLogPort } from '@module/audit/port/audit-log.port';
import { EventPublisherPort } from '@module/events/port/event-publisher.port';
import { createMock, getMock } from '@test/utils/create-mock';
import { LeaveApprovedEvent } from '../events/leave-approved.event';
import { LeaveRepositoryPort } from '../port/leave.repository.port';
import { LeaveService } from './leave.service';

const head: AuthUser = {
  id: 'head',
  institutionId: 'inst-1',
  roles: [Role.InstituteHead],
};
const teacher: AuthUser = {
  id: 'teacher',
  institutionId: 'inst-1',
  roles: [Role.SubjectTeacher],
};
const casual: LeaveType = {
  id: 'lt-casual',
  institutionId: 'inst-1',
  name: 'Casual',
  appliesTo: LeaveAppliesTo.Staff,
  maxDaysPerYear: 10,
  createdAt: new Date(),
};
const pending = (over: Partial<LeaveApplication> = {}): LeaveApplication => ({
  id: 'app-1',
  institutionId: 'inst-1',
  leaveTypeId: casual.id,
  applicantKind: ApplicantKind.Staff,
  userId: 'teacher',
  studentId: null,
  fromDate: '2026-04-01',
  toDate: '2026-04-03',
  reason: 'Family',
  status: LeaveStatus.Pending,
  appliedBy: 'teacher',
  decidedBy: null,
  decidedAt: null,
  decisionNote: null,
  createdAt: new Date(),
  ...over,
});

describe('LeaveService', () => {
  let service: LeaveService;
  let repo: jest.Mocked<LeaveRepositoryPort>;
  let audit: jest.Mocked<AuditLogPort>;
  let events: jest.Mocked<EventPublisherPort>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [LeaveService],
    })
      .useMocker(createMock)
      .compile();
    service = moduleRef.get(LeaveService);
    repo = getMock(moduleRef, LeaveRepositoryPort);
    audit = getMock(moduleRef, AuditLogPort);
    events = getMock(moduleRef, EventPublisherPort);
    repo.findTypeById.mockResolvedValue(casual);
    audit.record.mockResolvedValue();
  });

  describe('apply', () => {
    it('validates the date range and span', async () => {
      const base = { leaveTypeId: casual.id, reason: 'x' };
      await expect(
        service.apply(
          { ...base, fromDate: '2026-04-03', toDate: '2026-04-01' },
          teacher,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
      await expect(
        service.apply(
          { ...base, fromDate: '2026-01-01', toDate: '2026-12-31' },
          teacher,
        ),
      ).rejects.toThrow('at most');
    });

    it('rejects a type that does not apply to the applicant kind', async () => {
      await expect(
        service.apply(
          {
            leaveTypeId: casual.id,
            studentId: 'stu',
            fromDate: '2026-04-01',
            toDate: '2026-04-01',
            reason: 'ill',
          },
          teacher,
        ),
      ).rejects.toThrow('does not apply to student');
    });

    it('staff apply for themselves; on-behalf applications carry the student and the applier', async () => {
      repo.insertApplication.mockImplementation((data) =>
        Promise.resolve(pending(data)),
      );
      await service.apply(
        {
          leaveTypeId: casual.id,
          fromDate: '2026-04-01',
          toDate: '2026-04-03',
          reason: 'Family',
        },
        teacher,
      );
      expect(repo.insertApplication).toHaveBeenCalledWith(
        expect.objectContaining({
          applicantKind: 'staff',
          userId: 'teacher',
          studentId: null,
          appliedBy: 'teacher',
        }),
      );
    });
  });

  describe('approve', () => {
    it('approves a pending application, audits it and publishes leave.approved', async () => {
      repo.findById.mockResolvedValue(pending());
      repo.findApprovedInYear.mockResolvedValue([]);
      repo.decide.mockResolvedValue(
        pending({ status: LeaveStatus.Approved, decidedBy: 'head' }),
      );

      const result = await service.approve('app-1', { note: 'ok' }, head);

      expect(result.status).toBe('approved');
      expect(result.days).toBe(3);
      expect(audit.record).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'leave.approved',
          entityId: 'app-1',
        }),
      );
      const [event] = events.publish.mock.calls[0];
      expect(event).toBeInstanceOf(LeaveApprovedEvent);
      expect((event as LeaveApprovedEvent).applicantId).toBe('teacher');
    });

    it('refuses to exceed the yearly cap for the type', async () => {
      repo.findById.mockResolvedValue(pending());
      repo.findApprovedInYear.mockResolvedValue([
        pending({
          fromDate: '2026-02-01',
          toDate: '2026-02-08',
          status: LeaveStatus.Approved,
        }),
      ]);
      await expect(service.approve('app-1', {}, head)).rejects.toThrow(
        'exceed 10 days',
      );
      expect(repo.decide).not.toHaveBeenCalled();
    });

    it('409s when the application is no longer pending', async () => {
      repo.findById.mockResolvedValue(
        pending({ status: LeaveStatus.Rejected }),
      );
      await expect(service.approve('app-1', {}, head)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });
  });

  it('cancel is limited to the applicant unless an approver acts', async () => {
    repo.findById.mockResolvedValue(pending({ appliedBy: 'someone-else' }));
    await expect(service.cancel('app-1', teacher)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    repo.decide.mockResolvedValue(pending({ status: LeaveStatus.Cancelled }));
    expect((await service.cancel('app-1', head)).status).toBe('cancelled');
  });

  it('non-approvers only see their own applications', async () => {
    repo.findApplications.mockResolvedValue([
      pending(),
      pending({ id: 'other', userId: 'x', appliedBy: 'x' }),
    ]);
    expect((await service.list({}, teacher)).map((a) => a.id)).toEqual([
      'app-1',
    ]);
    expect(await service.list({}, head)).toHaveLength(2);
  });
});
