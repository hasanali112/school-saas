import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { DatabaseService } from '@common/services/database/database.service';
import type {
  AcademicSession,
  NewAcademicSession,
} from '../domain/academic-session';
import { SessionsRepositoryPort } from '../port/sessions.repository.port';
import { AcademicSessionEntity } from './entities/academic-session.entity';

@Injectable()
export class SessionsRepository implements SessionsRepositoryPort {
  constructor(private readonly db: DatabaseService) {}

  insert(data: NewAcademicSession): Promise<AcademicSession> {
    return this.db.tenant(async (m) => {
      if (data.isCurrent) await this.clearCurrent(m);
      return m.save(m.create(AcademicSessionEntity, data));
    });
  }

  findAll(): Promise<AcademicSession[]> {
    return this.db.tenant((m) =>
      m.find(AcademicSessionEntity, { order: { startsOn: 'DESC' } }),
    );
  }

  async findById(id: string): Promise<AcademicSession | undefined> {
    return (
      (await this.db.tenant((m) =>
        m.findOneBy(AcademicSessionEntity, { id }),
      )) ?? undefined
    );
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
      return (await m.findOneBy(AcademicSessionEntity, { id })) ?? undefined;
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
