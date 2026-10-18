import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DatabaseService } from '@database/database.service';
import { InstitutionRow, institutions } from '@database/schema';

/** RLS restricts the institutions table to the current tenant's own row, so no id filter is needed. */
@Injectable()
export class InstitutionsRepository {
  constructor(private readonly database: DatabaseService) {}

  findCurrent(): Promise<InstitutionRow | undefined> {
    return this.database.tenant((tx) => tx.query.institutions.findFirst());
  }

  updateCurrent(
    id: string,
    patch: Partial<InstitutionRow>,
  ): Promise<InstitutionRow | undefined> {
    return this.database.tenant(async (tx) => {
      const [row] = await tx
        .update(institutions)
        .set(patch)
        .where(eq(institutions.id, id))
        .returning();
      return row;
    });
  }
}
