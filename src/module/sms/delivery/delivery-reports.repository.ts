import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DatabaseService } from '@database/database.service';
import { smsMessages } from '@database/schema';

@Injectable()
export class DeliveryReportsRepository {
  constructor(private readonly database: DatabaseService) {}

  /**
   * Provider callbacks carry no tenant, so this runs as the system role and matches on
   * the provider id alone. Returns false when nothing matched.
   */
  applyReport(
    providerMessageId: string,
    status: 'delivered' | 'failed',
    error?: string,
  ): Promise<boolean> {
    return this.database.system(async (tx) => {
      const updated = await tx
        .update(smsMessages)
        .set({
          status,
          error: error ?? null,
          deliveredAt: status === 'delivered' ? new Date() : null,
        })
        .where(eq(smsMessages.providerMessageId, providerMessageId))
        .returning({ id: smsMessages.id });
      return updated.length > 0;
    });
  }
}
