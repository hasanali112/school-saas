import { Injectable } from '@nestjs/common';
import { and, asc, count, desc, eq, SQL } from 'drizzle-orm';
import { Page } from '@common/types/paginated';
import { DatabaseService } from '@database/database.service';
import {
  NewSmsBatchRow,
  NewSmsMessageRow,
  SmsBatchRow,
  smsBatches,
  SmsMessageRow,
  smsMessages,
} from '@database/schema';

export interface BatchFilter {
  status?: SmsBatchRow['status'];
  purpose?: SmsBatchRow['purpose'];
}

export interface MessageResult {
  id: string;
  status: 'sent' | 'failed';
  gateway: string | null;
  providerMessageId: string | null;
  error: string | null;
}

export interface FinishPatch {
  status: 'sent' | 'failed';
  sentCount: number;
  failedCount: number;
  sentBy: string;
}

/** Messages are inserted without the batch id; the repository fills it in. */
export type DraftMessage = Omit<NewSmsMessageRow, 'batchId' | 'institutionId'>;

@Injectable()
export class BatchesRepository {
  constructor(private readonly database: DatabaseService) {}

  /** Batch and its messages land together so a half-written draft never exists. */
  insertDraft(
    batch: NewSmsBatchRow,
    messages: readonly DraftMessage[],
  ): Promise<SmsBatchRow> {
    return this.database.tenant(async (tx) => {
      const [row] = await tx.insert(smsBatches).values(batch).returning();
      await tx.insert(smsMessages).values(
        messages.map((m) => ({
          ...m,
          institutionId: row.institutionId,
          batchId: row.id,
        })),
      );
      return row;
    });
  }

  findById(id: string): Promise<SmsBatchRow | undefined> {
    return this.database.tenant((tx) =>
      tx.query.smsBatches.findFirst({ where: eq(smsBatches.id, id) }),
    );
  }

  findByDedupeKey(key: string): Promise<SmsBatchRow | undefined> {
    return this.database.tenant((tx) =>
      tx.query.smsBatches.findFirst({ where: eq(smsBatches.dedupeKey, key) }),
    );
  }

  findPage(
    filter: BatchFilter,
    limit: number,
    offset: number,
  ): Promise<Page<SmsBatchRow>> {
    const clauses: SQL[] = [];
    if (filter.status) clauses.push(eq(smsBatches.status, filter.status));
    if (filter.purpose) clauses.push(eq(smsBatches.purpose, filter.purpose));
    const where = clauses.length ? and(...clauses) : undefined;
    return this.database.tenant(async (tx) => {
      const [rows, [{ total }]] = await Promise.all([
        tx
          .select()
          .from(smsBatches)
          .where(where)
          .orderBy(desc(smsBatches.createdAt))
          .limit(limit)
          .offset(offset),
        tx.select({ total: count() }).from(smsBatches).where(where),
      ]);
      return { rows, total };
    });
  }

  findMessages(batchId: string): Promise<SmsMessageRow[]> {
    return this.database.tenant((tx) =>
      tx
        .select()
        .from(smsMessages)
        .where(eq(smsMessages.batchId, batchId))
        .orderBy(asc(smsMessages.createdAt), asc(smsMessages.id)),
    );
  }

  /** draft → sending, only if still a draft: the guard against two officers pressing send. */
  markSending(id: string): Promise<SmsBatchRow | undefined> {
    return this.transition(id, 'draft', { status: 'sending' });
  }

  revertToDraft(id: string): Promise<SmsBatchRow | undefined> {
    return this.transition(id, 'sending', { status: 'draft' });
  }

  cancel(id: string): Promise<SmsBatchRow | undefined> {
    return this.transition(id, 'draft', { status: 'cancelled' });
  }

  finish(id: string, patch: FinishPatch): Promise<SmsBatchRow | undefined> {
    return this.transition(id, 'sending', { ...patch, sentAt: new Date() });
  }

  deleteDraft(id: string): Promise<void> {
    return this.database.tenant(async (tx) => {
      await tx
        .delete(smsBatches)
        .where(and(eq(smsBatches.id, id), eq(smsBatches.status, 'draft')));
    });
  }

  /** One transaction, one UPDATE per message; a batch is at most a few thousand rows. */
  recordResults(results: readonly MessageResult[]): Promise<void> {
    const sentAt = new Date();
    return this.database.tenant(async (tx) => {
      for (const r of results) {
        await tx
          .update(smsMessages)
          .set({
            status: r.status,
            gateway: r.gateway,
            providerMessageId: r.providerMessageId,
            error: r.error,
            sentAt: r.status === 'sent' ? sentAt : null,
          })
          .where(eq(smsMessages.id, r.id));
      }
    });
  }

  private transition(
    id: string,
    from: SmsBatchRow['status'],
    set: Partial<SmsBatchRow>,
  ): Promise<SmsBatchRow | undefined> {
    return this.database.tenant(async (tx) => {
      const [row] = await tx
        .update(smsBatches)
        .set(set)
        .where(and(eq(smsBatches.id, id), eq(smsBatches.status, from)))
        .returning();
      return row;
    });
  }
}
