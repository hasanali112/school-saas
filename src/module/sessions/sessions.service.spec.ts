import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DatabaseError } from 'pg';
import { AuthUser } from '@modules/auth/auth-user';
import { Role } from '@modules/auth/roles';
import { AcademicSessionRow } from '@database/schema';
import { createMock, getMock } from '@test/utils/create-mock';
import { SessionsRepository } from './sessions.repository';
import { SessionsService } from './sessions.service';

const actor: AuthUser = {
  id: 'u1',
  institutionId: 'inst-1',
  roles: [Role.AdminOfficer],
};
const row: AcademicSessionRow = {
  id: 's1',
  institutionId: 'inst-1',
  name: '2027',
  startsOn: '2027-01-01',
  endsOn: '2027-12-31',
  isCurrent: true,
  createdAt: new Date(),
};

describe('SessionsService', () => {
  let service: SessionsService;
  let repo: jest.Mocked<SessionsRepository>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [SessionsService],
    })
      .useMocker(createMock)
      .compile();
    service = moduleRef.get(SessionsService);
    repo = getMock(moduleRef, SessionsRepository);
  });

  it('rejects a session that ends before it starts', async () => {
    await expect(
      service.create(
        { name: '2027', startsOn: '2027-12-31', endsOn: '2027-01-01' },
        actor,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repo.insert).not.toHaveBeenCalled();
  });

  it('defaults isCurrent to false and stamps the institution', async () => {
    repo.insert.mockResolvedValue(row);
    await service.create(
      { name: '2027', startsOn: '2027-01-01', endsOn: '2027-12-31' },
      actor,
    );
    expect(repo.insert).toHaveBeenCalledWith(
      expect.objectContaining({ isCurrent: false, institutionId: 'inst-1' }),
    );
  });

  it('maps a duplicate name to 409', async () => {
    const pgError = new DatabaseError('dup', 0, 'error');
    pgError.code = '23505';
    repo.insert.mockRejectedValue(
      Object.assign(new Error('wrapped'), { cause: pgError }),
    );
    await expect(
      service.create(
        { name: '2027', startsOn: '2027-01-01', endsOn: '2027-12-31' },
        actor,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('resolveId prefers the explicit id and fails clearly without a current session', async () => {
    expect(await service.resolveId('explicit')).toBe('explicit');
    repo.findCurrentId.mockResolvedValue(undefined);
    await expect(service.resolveId()).rejects.toBeInstanceOf(
      BadRequestException,
    );
    repo.findCurrentId.mockResolvedValue('current');
    expect(await service.resolveId()).toBe('current');
  });

  it('setCurrent returns 404 for an unknown id', async () => {
    repo.setCurrent.mockResolvedValue(undefined);
    await expect(service.setCurrent('nope')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
