import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DatabaseError } from 'pg';
import { AuthUser } from '@modules/auth/auth-user';
import { Role } from '@modules/auth/roles';
import { EnrolmentRow, StudentRow } from '@database/schema';
import { SessionsService } from '@modules/academics/sessions/sessions.service';
import { createMock, getMock } from '@test/utils/create-mock';
import { StudentsRepository } from '../students.repository';
import { EnrolmentsRepository, OfferedSubject } from './enrolments.repository';
import { EnrolmentsService } from './enrolments.service';

const actor: AuthUser = {
  id: 'admin',
  institutionId: 'inst-1',
  roles: [Role.AdminOfficer],
};
const student = {
  id: 'stu-1',
  institutionId: 'inst-1',
  admissionNo: 'A-1',
  nameBn: 'x',
  nameEn: 'x',
  religion: 'islam',
  status: 'active',
} as StudentRow;
const offered: OfferedSubject[] = [
  { subjectId: 'math', role: 'compulsory', religion: null },
  { subjectId: 'higher-math', role: 'fourth_optional', religion: null },
  { subjectId: 'islam', role: 'religion', religion: 'islam' },
  { subjectId: 'hindu', role: 'religion', religion: 'hindu' },
];
const base = { sectionId: 'sec-1', rollNo: 7 };

describe('EnrolmentsService', () => {
  let service: EnrolmentsService;
  let repo: jest.Mocked<EnrolmentsRepository>;
  let students: jest.Mocked<StudentsRepository>;
  let sessions: jest.Mocked<SessionsService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [EnrolmentsService],
    })
      .useMocker(createMock)
      .compile();
    service = moduleRef.get(EnrolmentsService);
    repo = getMock(moduleRef, EnrolmentsRepository);
    students = getMock(moduleRef, StudentsRepository);
    sessions = getMock(moduleRef, SessionsService);

    students.findById.mockResolvedValue(student);
    sessions.resolveId.mockResolvedValue('sess-1');
    repo.findOfferedSubjects.mockResolvedValue(offered);
    repo.insert.mockImplementation((data) =>
      Promise.resolve({ id: 'e1', ...data } as EnrolmentRow),
    );
  });

  it('404s for an unknown student and refuses an exited one', async () => {
    students.findById.mockResolvedValue(undefined);
    await expect(service.enrol('nope', base, actor)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    students.findById.mockResolvedValue({ ...student, status: 'exited' });
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
    const cause = new DatabaseError('dup', 0, 'error');
    cause.code = '23505';
    repo.insert.mockRejectedValue(
      Object.assign(new Error('wrapped'), { cause }),
    );
    await expect(service.enrol('stu-1', base, actor)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('roster maps enrolment + student into flat entries ordered as returned', async () => {
    repo.findRoster.mockResolvedValue([
      { enrolment: { id: 'e1', rollNo: 1 } as EnrolmentRow, student },
    ]);
    const roster = await service.roster('sec-1');
    expect(roster.students[0]).toMatchObject({
      enrolmentId: 'e1',
      rollNo: 1,
      admissionNo: 'A-1',
    });
    expect(roster.students[0]).not.toHaveProperty('institutionId');
  });
});
