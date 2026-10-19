import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DatabaseError } from 'pg';
import { AuthUser } from '@common/types/auth-user';
import { Role } from '@common/types/role';
import { createMock, getMock } from '@test/utils/create-mock';
import { GuardianRelation } from '../domain/guardian';
import { GuardiansRepository } from '../application/ports/guardians.repository.port';
import { GuardiansService } from './guardians.service';

const actor: AuthUser = {
  id: 'admin',
  institutionId: 'inst-1',
  roles: [Role.AdminOfficer],
};

describe('GuardiansService', () => {
  let service: GuardiansService;
  let repo: jest.Mocked<GuardiansRepository>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [GuardiansService],
    })
      .useMocker(createMock)
      .compile();
    service = moduleRef.get(GuardiansService);
    repo = getMock(moduleRef, GuardiansRepository);
  });

  it('links and returns the flattened guardian view without institution ids', async () => {
    repo.link.mockResolvedValue({
      link: {
        id: 'l1',
        institutionId: 'inst-1',
        studentId: 's1',
        guardianId: 'g1',
        relation: GuardianRelation.Mother,
        isPrimary: true,
        createdAt: new Date(),
      },
      guardian: {
        id: 'g1',
        institutionId: 'inst-1',
        phone: '01711111111',
        name: 'Amina',
        createdAt: new Date(),
      },
    });
    const result = await service.link(
      's1',
      {
        phone: '01711111111',
        name: 'Amina',
        relation: GuardianRelation.Mother,
        isPrimary: true,
      },
      actor,
    );
    expect(repo.link).toHaveBeenCalledWith(
      expect.objectContaining({ studentId: 's1', institutionId: 'inst-1' }),
    );
    expect(result).toEqual({
      guardianId: 'g1',
      phone: '01711111111',
      name: 'Amina',
      relation: GuardianRelation.Mother,
      isPrimary: true,
    });
  });

  it('maps a duplicate link to 409 and a missing link to 404', async () => {
    const cause = new DatabaseError('dup', 0, 'error');
    cause.code = '23505';
    repo.link.mockRejectedValue(Object.assign(new Error('wrapped'), { cause }));
    await expect(
      service.link(
        's1',
        {
          phone: '01711111111',
          name: 'x',
          relation: GuardianRelation.Other,
          isPrimary: false,
        },
        actor,
      ),
    ).rejects.toBeInstanceOf(ConflictException);

    repo.unlink.mockResolvedValue(false);
    await expect(service.unlink('s1', 'g1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
