import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DatabaseError } from 'pg';
import { AuthUser } from '@modules/auth/auth-user';
import { Role } from '@modules/auth/roles';
import { StudentRow } from '@database/schema';
import { DomainEvents } from '@shared/events/domain-events.service';
import { createMock, getMock } from '@test/utils/create-mock';
import { anyOf } from '@test/utils/matchers';
import { ListStudentsQueryDto } from './dto/list-students-query.dto';
import { StudentCreatedEvent } from './events/student-created.event';
import { StudentExitedEvent } from './events/student-exited.event';
import { StudentsRepository } from './students.repository';
import { StudentsService } from './students.service';

const INSTITUTION_ID = '11111111-1111-4111-8111-111111111111';
const actor: AuthUser = {
  id: 'u1',
  institutionId: INSTITUTION_ID,
  roles: [Role.AdminOfficer],
};

const row: StudentRow = {
  id: '22222222-2222-4222-8222-222222222222',
  institutionId: INSTITUTION_ID,
  admissionNo: 'A-001',
  nameBn: 'রহিম',
  nameEn: 'Rahim',
  dateOfBirth: null,
  gender: null,
  bloodGroup: null,
  religion: null,
  birthCertificateNo: null,
  addressBn: null,
  addressEn: null,
  photoKey: null,
  status: 'active',
  exitedAt: null,
  exitReason: null,
  createdAt: new Date('2026-01-01'),
};

describe('StudentsService', () => {
  let service: StudentsService;
  let repo: jest.Mocked<StudentsRepository>;
  let events: jest.Mocked<DomainEvents>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [StudentsService],
    })
      .useMocker(createMock)
      .compile();
    service = moduleRef.get(StudentsService);
    repo = getMock(moduleRef, StudentsRepository);
    events = getMock(moduleRef, DomainEvents);
  });

  describe('create', () => {
    it('stamps the actor institution, publishes student.created and returns a response DTO', async () => {
      repo.insert.mockResolvedValue(row);

      const result = await service.create(
        { admissionNo: 'A-001', nameBn: 'রহিম', nameEn: 'Rahim' },
        actor,
      );

      expect(repo.insert).toHaveBeenCalledWith({
        admissionNo: 'A-001',
        nameBn: 'রহিম',
        nameEn: 'Rahim',
        institutionId: INSTITUTION_ID,
      });
      expect(events.publish).toHaveBeenCalledWith(
        expect.any(StudentCreatedEvent),
      );
      expect(result).not.toHaveProperty('institutionId');
      expect(result.id).toBe(row.id);
    });

    it('maps a unique violation to 409 Conflict', async () => {
      const pgError = new DatabaseError('duplicate key', 0, 'error');
      pgError.code = '23505';
      repo.insert.mockRejectedValue(
        Object.assign(new Error('wrapped'), { cause: pgError }),
      );

      await expect(
        service.create(
          { admissionNo: 'A-001', nameBn: 'x', nameEn: 'x' },
          actor,
        ),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(events.publish).not.toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('throws 404 when the row is missing', async () => {
      repo.findById.mockResolvedValue(undefined);
      await expect(service.getById(row.id)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('exit', () => {
    it('marks the student exited with the reason and publishes student.exited', async () => {
      repo.findById.mockResolvedValue(row);
      repo.update.mockResolvedValue({
        ...row,
        status: 'exited',
        exitReason: 'Moved',
      });

      const result = await service.exit(row.id, { reason: 'Moved' }, actor);

      expect(repo.update).toHaveBeenCalledWith(
        row.id,
        expect.objectContaining({
          status: 'exited',
          exitReason: 'Moved',
          exitedAt: anyOf(Date),
        }),
      );
      expect(events.publish).toHaveBeenCalledWith(
        expect.any(StudentExitedEvent),
      );
      expect(result.status).toBe('exited');
    });

    it('refuses to exit twice', async () => {
      repo.findById.mockResolvedValue({ ...row, status: 'exited' });
      await expect(
        service.exit(row.id, { reason: 'again' }, actor),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(repo.update).not.toHaveBeenCalled();
    });
  });

  describe('list', () => {
    it('returns a Paginated result with meta from the query', async () => {
      repo.findPage.mockResolvedValue({ rows: [row], total: 1 });
      const query = Object.assign(new ListStudentsQueryDto(), {
        page: 2,
        limit: 10,
        search: 'Rah',
      });

      const result = await service.list(query);

      expect(repo.findPage).toHaveBeenCalledWith(10, 10, {
        search: 'Rah',
        status: undefined,
      });
      expect(result.meta).toEqual({ total: 1, page: 2, limit: 10 });
      expect(result.items).toHaveLength(1);
    });
  });
});
