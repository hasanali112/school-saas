import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { DatabaseService } from '@common/services/database/database.service';
import { SessionsRepository } from '../../../../application/ports/sessions.repository.port';
import type {
  AcademicSession,
  NewAcademicSession,
} from '../../../../domain/academic-session';
import { AcademicSessionEntity } from '../entities/academic-session.entity';
import { AcademicSessionMapper } from '../mappers/academic-session.mapper';

@Injectable()
export class SessionsRelationalRepository implements SessionsRepository {
  constructor(private readonly db: DatabaseService) {}

  insert(data: NewAcademicSession): Promise<AcademicSession> {
    return this.db.tenant(async (m) => {
      if (data.isCurrent) await this.clearCurrent(m);
      const row = await m.save(AcademicSessionMapper.toPersistence(data));
      return AcademicSessionMapper.toDomain(row);
    });
  }

  async findAll(): Promise<AcademicSession[]> {
    const rows = await this.db.tenant((m) =>
      m.find(AcademicSessionEntity, { order: { startsOn: 'DESC' } }),
    );
    return rows.map((row) => AcademicSessionMapper.toDomain(row));
  }

  async findById(id: string): Promise<AcademicSession | undefined> {
    const row = await this.db.tenant((m) =>
      m.findOneBy(AcademicSessionEntity, { id }),
    );
    return row ? AcademicSessionMapper.toDomain(row) : undefined;
  }

  async findCurrentId(): Promise<string | undefined> {
    const row = await this.db.tenant((m) =>
      m.findOne(AcademicSessionEntity, {
        select: { id: true },
        where: { isCurrent: true },
      }),
    );
    return row?.id;
  }

  setCurrent(id: string): Promise<AcademicSession | undefined> {
    return this.db.tenant(async (m) => {
      await this.clearCurrent(m);
      const { affected } = await m.update(
        AcademicSessionEntity,
        { id },
        { isCurrent: true },
      );
      if (!affected) return undefined;
      const row = await m.findOneByOrFail(AcademicSessionEntity, { id });
      return AcademicSessionMapper.toDomain(row);
    });
  }

  private async clearCurrent(m: EntityManager): Promise<void> {
    await m.update(
      AcademicSessionEntity,
      { isCurrent: true },
      { isCurrent: false },
    );
  }
}
