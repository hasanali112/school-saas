import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@common/services/database/database.service';
import type { Consent, ConsentPurpose, NewConsent } from '../domain/consent';
import { ConsentRepositoryPort } from '../port/consent.repository.port';
import { CONSENT_CONFLICT, ConsentEntity } from './entities/consent.entity';

@Injectable()
export class ConsentRepository implements ConsentRepositoryPort {
  constructor(private readonly db: DatabaseService) {}

  findForGuardian(guardianId: string): Promise<Consent[]> {
    return this.db.tenant((m) =>
      m.find(ConsentEntity, {
        where: { guardianId },
        order: { purpose: 'ASC' },
      }),
    );
  }

  async findOne(
    guardianId: string,
    purpose: ConsentPurpose,
  ): Promise<Consent | undefined> {
    return (
      (await this.db.tenant((m) =>
        m.findOneBy(ConsentEntity, { guardianId, purpose }),
      )) ?? undefined
    );
  }

  upsert(data: NewConsent): Promise<Consent> {
    return this.db.tenant(async (m) => {
      await m.upsert(
        ConsentEntity,
        { ...data, updatedAt: new Date() },
        CONSENT_CONFLICT,
      );
      return m.findOneByOrFail(ConsentEntity, {
        institutionId: data.institutionId,
        guardianId: data.guardianId,
        purpose: data.purpose,
      });
    });
  }
}
