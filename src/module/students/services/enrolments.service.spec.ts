import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ClassSubjectRole, Religion } from '@module/academics/domain/subject';
import type { OfferedSubject } from '@module/academics/domain/subject';
import { SessionsFacade } from '@module/academics/services/sessions.facade';
import { SubjectsFacade } from '@module/academics/services/subjects.facade';
import type { AuthUser } from '@module/auth/domain/auth-user';
import { Role } from '@module/auth/domain/role';
import { createMock, getMock } from '@test/utils/create-mock';
import { pgError, UNIQUE_VIOLATION } from '@test/utils/pg-error';
import type { Enrolment } from '../domain/enrolment';
import { StudentStatus } from '../domain/student';
import type { Student } from '../domain/student';
import { EnrolmentsRepository } from '../application/ports/enrolments.repository.port';
import { StudentsRepository } from '../application/ports/students.repository.port';
import { EnrolmentsService } from './enrolments.service';

const actor: AuthUser = {
  id: 'admin',
  institutionId: 'inst-1',
  roles: [Role.AdminOfficer],
};
const student: Student = {
  id: 'stu-1',
  institutionId: 'inst-1',
  admissionNo: 'A-1',
  nameBn: 'x',
  nameEn: 'x',
  dateOfBirth: null,
  gender: null,
  bloodGroup: null,
  religion: Religion.Islam,
  birthCertificateNo: null,
  addressBn: null,
  addressEn: null,
  photoKey: null,
  status: StudentStatus.Active,
  exitedAt: null,
  exitReason: null,
  createdAt: new Date('2026-01-01'),
};
const offered: OfferedSubject[] = [
  { subjectId: 'math', role: ClassSubjectRole.Compulsory, religion: null },
  {
    subjectId: 'higher-math',
    role: ClassSubjectRole.FourthOptional,
    religion: null,
  },
  {
    subjectId: 'islam',
    role: ClassSubjectRole.Religion,
    religion: Religion.Islam,
  },
  {
    subjectId: 'hindu',
    role: ClassSubjectRole.Religion,
    religion: Religion.Hindu,
  },
];
const enrolment = (data: Partial<Enrolment> = {}): Enrolment => ({
  id: 'e1',
  institutionId: 'inst-1',
  studentId: 'stu-1',
  sessionId: 'sess-1',
  sectionId: 'sec-1',
  rollNo: 7,
  fourthSubjectId: null,
  religionSubjectId: null,
  createdAt: new Date('2026-01-01'),
  ...data,
});
const base = { sectionId: 'sec-1', rollNo: 7 };

describe('EnrolmentsService', () => {
  let service: EnrolmentsService;
  let repo: jest.Mocked<EnrolmentsRepository>;
  let students: jest.Mocked<StudentsRepository>;
  let sessions: jest.Mocked<SessionsFacade>;
  let subjects: jest.Mocked<SubjectsFacade>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [EnrolmentsService],
    })
      .useMocker(createMock)
      .compile();
    service = moduleRef.get(EnrolmentsService);
    repo = getMock(moduleRef, EnrolmentsRepository);
    students = getMock(moduleRef, StudentsRepository);
    sessions = getMock(moduleRef, SessionsFacade);
    subjects = getMock(moduleRef, SubjectsFacade);

    students.findById.mockResolvedValue(student);
    sessions.resolveId.mockResolvedValue('sess-1');
    subjects.offeredInSection.mockResolvedValue(offered);
    repo.insert.mockImplementation((data) => Promise.resolve(enrolment(data)));
  });

  it('404s for an unknown student and refuses an exited one', async () => {
    students.findById.mockResolvedValue(undefined);
    await expect(service.enrol('nope', base, actor)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    students.findById.mockResolvedValue({
      ...student,
      status: StudentStatus.Exited,
    });
    await expect(service.enrol('stu-1', base, actor)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('rejects a 4th subject that is not offered as fourth_optional in the class', async () => {
    await expect(
      service.enrol('stu-1', { ...base, fourthSubjectId: 'math' }, actor),
    ).rejects.toThrow('4th subject');
    await expect(
      service.enrol('stu-1', { ...base, fourthSubjectId: 'unknown' }, actor),
    ).rejects.toThrow('4th subject');
  });

  it("rejects a religion subject that does not match the student's religion", async () => {
    await expect(
      service.enrol('stu-1', { ...base, religionSubjectId: 'hindu' }, actor),
    ).rejects.toThrow('religion');
    await expect(
      service.enrol('stu-1', { ...base, religionSubjectId: 'math' }, actor),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('accepts valid choices, resolves the session and stamps the tenant', async () => {
    const result = await service.enrol(
      'stu-1',
      { ...base, fourthSubjectId: 'higher-math', religionSubjectId: 'islam' },
      actor,
    );
    expect(repo.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionId: 'sess-1',
        studentId: 'stu-1',
        institutionId: 'inst-1',
        rollNo: 7,
      }),
    );
    expect(result.sessionId).toBe('sess-1');
  });

  it('maps duplicate enrolment or taken roll to 409', async () => {
    repo.insert.mockRejectedValue(pgError(UNIQUE_VIOLATION));
    await expect(service.enrol('stu-1', base, actor)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('roster maps enrolment + student into flat entries ordered as returned', async () => {
    repo.findRoster.mockResolvedValue([
      { enrolment: enrolment({ rollNo: 1 }), student },
    ]);
    sessions.resolveId.mockResolvedValue('sess-1');
    const roster = await service.roster('sec-1');
    expect(roster.students[0]).toMatchObject({
      enrolmentId: 'e1',
      rollNo: 1,
      admissionNo: 'A-1',
    });
    expect(roster.students[0]).not.toHaveProperty('institutionId');
  });
});
