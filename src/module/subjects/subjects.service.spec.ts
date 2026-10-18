import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DatabaseError } from 'pg';
import { AuthUser } from '@modules/auth/auth-user';
import { Role } from '@modules/auth/roles';
import { SubjectRow } from '@database/schema';
import { createMock, getMock } from '@test/utils/create-mock';
import { ClassSubjectRole } from '../dto/attach-class-subject.dto';
import { Religion, SubjectKind } from '../dto/create-subject.dto';
import { SubjectsRepository } from './subjects.repository';
import { SubjectsService } from './subjects.service';

const actor: AuthUser = {
  id: 'u1',
  institutionId: 'inst-1',
  roles: [Role.AdminOfficer],
};
const general: SubjectRow = {
  id: 's-math',
  institutionId: 'inst-1',
  code: '109',
  nameBn: 'গণিত',
  nameEn: 'Mathematics',
  kind: 'general',
  religion: null,
  createdAt: new Date(),
};
const islam: SubjectRow = {
  ...general,
  id: 's-islam',
  code: '111',
  kind: 'religion',
  religion: 'islam',
};

function pgError(code: string): Error {
  const cause = new DatabaseError('x', 0, 'error');
  cause.code = code;
  return Object.assign(new Error('wrapped'), { cause });
}

describe('SubjectsService', () => {
  let service: SubjectsService;
  let repo: jest.Mocked<SubjectsRepository>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [SubjectsService],
    })
      .useMocker(createMock)
      .compile();
    service = moduleRef.get(SubjectsService);
    repo = getMock(moduleRef, SubjectsRepository);
  });

  describe('create', () => {
    it('requires religion for a religion subject and forbids it otherwise', async () => {
      await expect(
        service.create(
          { code: '111', nameBn: 'x', nameEn: 'x', kind: SubjectKind.Religion },
          actor,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
      await expect(
        service.create(
          {
            code: '109',
            nameBn: 'x',
            nameEn: 'x',
            kind: SubjectKind.General,
            religion: Religion.Islam,
          },
          actor,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(repo.insert).not.toHaveBeenCalled();
    });

    it('stores null religion for general subjects and maps duplicates to 409', async () => {
      repo.insert.mockResolvedValue(general);
      await service.create(
        {
          code: '109',
          nameBn: 'গণিত',
          nameEn: 'Mathematics',
          kind: SubjectKind.General,
        },
        actor,
      );
      expect(repo.insert).toHaveBeenCalledWith(
        expect.objectContaining({ religion: null, institutionId: 'inst-1' }),
      );

      repo.insert.mockRejectedValue(pgError('23505'));
      await expect(
        service.create(
          { code: '109', nameBn: 'x', nameEn: 'x', kind: SubjectKind.General },
          actor,
        ),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('attachToClass', () => {
    it('404s for an unknown subject (including another tenant’s, hidden by RLS)', async () => {
      repo.findById.mockResolvedValue(undefined);
      await expect(
        service.attachToClass(
          'c1',
          { subjectId: 'nope', role: ClassSubjectRole.Compulsory },
          actor,
        ),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('forces the religion role to match the subject kind both ways', async () => {
      repo.findById.mockResolvedValue(islam);
      await expect(
        service.attachToClass(
          'c1',
          { subjectId: islam.id, role: ClassSubjectRole.Compulsory },
          actor,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);

      repo.findById.mockResolvedValue(general);
      await expect(
        service.attachToClass(
          'c1',
          { subjectId: general.id, role: ClassSubjectRole.Religion },
          actor,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(repo.attachToClass).not.toHaveBeenCalled();
    });

    it('maps a foreign-key miss on the class to 400', async () => {
      repo.findById.mockResolvedValue(general);
      repo.attachToClass.mockRejectedValue(pgError('23503'));
      await expect(
        service.attachToClass(
          'other-tenant-class',
          { subjectId: general.id, role: ClassSubjectRole.Compulsory },
          actor,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });
});
