import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthUser } from '@module/auth/domain/auth-user';
import { Role } from '@module/auth/domain/role';
import type { SectionClassTeacher } from '@module/academics/domain/teacher-assignment';
import { createMock, getMock } from '@test/utils/create-mock';
import { SessionsService } from './sessions.service';
import { TeachersRepositoryPort } from '../port/teachers.repository.port';
import { TeachersService } from './teachers.service';

const actor: AuthUser = {
  id: 'admin',
  institutionId: 'inst-1',
  roles: [Role.AdminOfficer],
};
const dto = { sessionId: 'sess', subjectId: 'subj', teacherUserId: 'teacher' };

describe('TeachersService', () => {
  let service: TeachersService;
  let repo: jest.Mocked<TeachersRepositoryPort>;
  let sessions: jest.Mocked<SessionsService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [TeachersService],
    })
      .useMocker(createMock)
      .compile();
    service = moduleRef.get(TeachersService);
    repo = getMock(moduleRef, TeachersRepositoryPort);
    sessions = getMock(moduleRef, SessionsService);
  });

  it('rejects a teacher id that is not a user of this tenant', async () => {
    repo.findUserRoles.mockResolvedValue(undefined);
    await expect(
      service.assignSubjectTeacher('sec', dto, actor),
    ).rejects.toThrow('Unknown teacher');
    expect(repo.upsertAssignment).not.toHaveBeenCalled();
  });

  it('rejects a user without a teaching role', async () => {
    repo.findUserRoles.mockResolvedValue([Role.Guardian]);
    await expect(
      service.assignSubjectTeacher('sec', dto, actor),
    ).rejects.toThrow('teaching role');
  });

  it('upserts for a subject teacher and stamps section and institution', async () => {
    repo.findUserRoles.mockResolvedValue([Role.SubjectTeacher]);
    repo.upsertAssignment.mockResolvedValue({
      id: 'a1',
      ...dto,
      sectionId: 'sec',
      institutionId: 'inst-1',
      createdAt: new Date(),
    });
    const result = await service.assignSubjectTeacher('sec', dto, actor);
    expect(repo.upsertAssignment).toHaveBeenCalledWith({
      ...dto,
      sectionId: 'sec',
      institutionId: 'inst-1',
    });
    expect(result.sectionId).toBe('sec');
  });

  it('resolves the session through SessionsService and surfaces its failure', async () => {
    sessions.resolveId.mockRejectedValue(
      new BadRequestException('No current session; pass sessionId'),
    );
    await expect(service.myAssignments(actor)).rejects.toBeInstanceOf(
      BadRequestException,
    );

    sessions.resolveId.mockResolvedValue('current');
    const classTeacherOf: SectionClassTeacher = {
      id: 'ct-1',
      institutionId: 'inst-1',
      sessionId: 'current',
      sectionId: 'sec-a',
      teacherUserId: 'admin',
      createdAt: new Date('2026-01-01'),
    };
    repo.findForTeacher.mockResolvedValue({
      classTeacherOf: [classTeacherOf],
      subjectAssignments: [],
    });
    const result = await service.myAssignments(actor);
    expect(repo.findForTeacher).toHaveBeenCalledWith('admin', 'current');
    expect(result.classTeacherOf).toEqual(['sec-a']);
  });

  it('removeSubjectTeacher 404s when nothing was deleted', async () => {
    repo.removeAssignment.mockResolvedValue(false);
    await expect(
      service.removeSubjectTeacher('sec', 'a1'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
