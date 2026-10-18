import { Injectable } from '@nestjs/common';
import { and, asc, eq } from 'drizzle-orm';
import { DatabaseService } from '@database/database.service';
import { ConsentRow, consents, NewConsentRow } from '@database/schema';

@Injectable()
export class ConsentRepository {
  constructor(private readonly database: DatabaseService) {}

  findForGuardian(guardianId: string): Promise<ConsentRow[]> {
    return this.database.tenant((tx) =>
      tx
        .select()
        .from(consents)
        .where(eq(consents.guardianId, guardianId))
        .orderBy(asc(consents.purpose)),
    );
  }

  findOne(
    guardianId: string,
    purpose: ConsentRow['purpose'],
  ): Promise<ConsentRow | undefined> {
    return this.database.tenant((tx) =>
      tx.query.consents.findFirst({
        where: and(
          eq(consents.guardianId, guardianId),
          eq(consents.purpose, purpose),
        ),
      }),
    );
  }

  /** One row per guardian and purpose: a repeat decision replaces the previous one. */
  upsert(data: NewConsentRow): Promise<ConsentRow> {
    return this.database.tenant(async (tx) => {
      const [row] = await tx
        .insert(consents)
        .values(data)
        .onConflictDoUpdate({
          target: [
            consents.institutionId,
            consents.guardianId,
            consents.purpose,
          ],
          set: {
            granted: data.granted,
            noticeVersion: data.noticeVersion,
            source: data.source,
            recordedBy: data.recordedBy,
            note: data.note,
            updatedAt: new Date(),
          },
        })
        .returning();
      return row;
    });
  }
}
