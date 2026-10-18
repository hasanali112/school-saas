import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@common/services/database/database.service';
import type {
  Consent,
  ConsentPurpose,
  NewConsent,
} from '../../../../domain/consent';
import { ConsentRepository } from '../../../../application/ports/consent.repository.port';
import { CONSENT_CONFLICT, ConsentEntity } from '../entities/consent.entity';
import { ConsentMapper } from '../mappers/consent.mapper';

@Injectable()
export class ConsentRelationalRepository implements ConsentRepository {
  constructor(private readonly db: DatabaseService) {}

  async findForGuardian(guardianId: string): Promise<Consent[]> {
    const rows = await this.db.tenant((m) =>
      m.find(ConsentEntity, {
        where: { guardianId },
        order: { purpose: 'ASC' },
      }),
    );
    return rows.map((row) => ConsentMapper.toDomain(row));
  }

  async findOne(
    guardianId: string,
    purpose: ConsentPurpose,
  ): Promise<Consent | undefined> {
    const row = await this.db.tenant((m) =>
      m.findOneBy(ConsentEntity, { guardianId, purpose }),
    );
    return row ? ConsentMapper.toDomain(row) : undefined;
  }

  upsert(data: NewConsent): Promise<Consent> {
    return this.db.tenant(async (m) => {
      await m.upsert(
        ConsentEntity,
        { ...data, updatedAt: new Date() },
        CONSENT_CONFLICT,
      );
      const row = await m.findOneByOrFail(ConsentEntity, {
        institutionId: data.institutionId,
        guardianId: data.guardianId,
        purpose: data.purpose,
      });
      return ConsentMapper.toDomain(row);
    });
  }
}
