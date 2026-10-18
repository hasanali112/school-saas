import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@common/services/database/database.service';
import { withoutUndefined } from '@common/utils/object/without-undefined';
import type { Institution, InstitutionPatch } from '../domain/institution';
import { InstitutionsRepositoryPort } from '../port/institutions.repository.port';
import { InstitutionEntity } from './entities/institution.entity';

@Injectable()
export class InstitutionsRepository implements InstitutionsRepositoryPort {
  constructor(private readonly db: DatabaseService) {}

  /** No id filter: RLS returns only the current tenant's row. */
  async findCurrent(): Promise<Institution | undefined> {
    const rows = await this.db.tenant((m) =>
      m.find(InstitutionEntity, { take: 1 }),
    );
    return rows[0];
  }

  updateCurrent(
    id: string,
    patch: InstitutionPatch,
  ): Promise<Institution | undefined> {
    const values = withoutUndefined(patch);
    return this.db.tenant(async (m) => {
      if (Object.keys(values).length)
        await m.update(InstitutionEntity, { id }, values);
      return (await m.findOneBy(InstitutionEntity, { id })) ?? undefined;
    });
  }
}
