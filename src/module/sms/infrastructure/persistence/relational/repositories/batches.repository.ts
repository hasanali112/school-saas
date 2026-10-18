import { Injectable } from '@nestjs/common';
import { FindOptionsWhere } from 'typeorm';
import { DatabaseService } from '@common/services/database/database.service';
import type { Page } from '@common/types/paginated';
import { SmsBatchStatus, SmsMessageStatus } from '../../../../domain/sms';
import type {
  BatchFilter,
  DraftMessage,
  FinishPatch,
  MessageResult,
  NewSmsBatch,
  SmsBatch,
  SmsMessage,
} from '../../../../domain/sms-batch';
import { BatchesRepository } from '../../../../application/ports/batches.repository.port';
import { SmsBatchEntity } from '../entities/sms-batch.entity';
import { SmsMessageEntity } from '../entities/sms-message.entity';
import { SmsBatchMapper } from '../mappers/sms-batch.mapper';
import { SmsMessageMapper } from '../mappers/sms-message.mapper';

/** Rows per INSERT; keeps every statement well under Postgres' bind-parameter limit. */
const CHUNK_SIZE = 1000;

/** The columns a state transition may change. */
interface BatchTransition {
  status: SmsBatchStatus;
  sentCount?: number;
  failedCount?: number;
  sentBy?: string;
  sentAt?: Date;
}

@Injectable()
export class BatchesRelationalRepository implements BatchesRepository {
  constructor(private readonly db: DatabaseService) {}

  insertDraft(
    batch: NewSmsBatch,
    messages: readonly DraftMessage[],
  ): Promise<SmsBatch> {
    return this.db.tenant(async (m) => {
      const row = await m.save(SmsBatchMapper.toPersistence(batch));
      const values = messages.map((message) => ({
        ...message,
        institutionId: row.institutionId,
        batchId: row.id,
      }));
      for (let i = 0; i < values.length; i += CHUNK_SIZE)
        await m.insert(SmsMessageEntity, values.slice(i, i + CHUNK_SIZE));
      return SmsBatchMapper.toDomain(row);
    });
  }

  async findById(id: string): Promise<SmsBatch | undefined> {
    const row = await this.db.tenant((m) =>
      m.findOneBy(SmsBatchEntity, { id }),
    );
    return row ? SmsBatchMapper.toDomain(row) : undefined;
  }

  async findByDedupeKey(key: string): Promise<SmsBatch | undefined> {
    const row = await this.db.tenant((m) =>
      m.findOneBy(SmsBatchEntity, { dedupeKey: key }),
    );
    return row ? SmsBatchMapper.toDomain(row) : undefined;
  }

  findPage(
    filter: BatchFilter,
    limit: number,
    offset: number,
  ): Promise<Page<SmsBatch>> {
    const where: FindOptionsWhere<SmsBatchEntity> = {};
    if (filter.status) where.status = filter.status;
    if (filter.purpose) where.purpose = filter.purpose;
    return this.db.tenant(async (m) => {
      const [rows, total] = await m.findAndCount(SmsBatchEntity, {
        where,
        order: { createdAt: 'DESC' },
        take: limit,
        skip: offset,
      });
      return { rows: rows.map((row) => SmsBatchMapper.toDomain(row)), total };
    });
  }

  async findMessages(batchId: string): Promise<SmsMessage[]> {
    const rows = await this.db.tenant((m) =>
      m.find(SmsMessageEntity, {
        where: { batchId },
        order: { createdAt: 'ASC', id: 'ASC' },
      }),
    );
    return rows.map((row) => SmsMessageMapper.toDomain(row));
  }

  markSending(id: string): Promise<SmsBatch | undefined> {
    return this.transition(id, SmsBatchStatus.Draft, {
      status: SmsBatchStatus.Sending,
    });
  }

  revertToDraft(id: string): Promise<SmsBatch | undefined> {
    return this.transition(id, SmsBatchStatus.Sending, {
      status: SmsBatchStatus.Draft,
    });
  }

  cancel(id: string): Promise<SmsBatch | undefined> {
    return this.transition(id, SmsBatchStatus.Draft, {
      status: SmsBatchStatus.Cancelled,
    });
  }

  finish(id: string, patch: FinishPatch): Promise<SmsBatch | undefined> {
    return this.transition(id, SmsBatchStatus.Sending, {
      ...patch,
      sentAt: new Date(),
    });
  }

  async deleteDraft(id: string): Promise<void> {
    await this.db.tenant((m) =>
      m.delete(SmsBatchEntity, { id, status: SmsBatchStatus.Draft }),
    );
  }

  /** One transaction, one UPDATE per message; a batch is at most a few thousand rows. */
  async recordResults(results: readonly MessageResult[]): Promise<void> {
    const sentAt = new Date();
    await this.db.tenant(async (m) => {
      for (const r of results) {
        await m.update(
          SmsMessageEntity,
          { id: r.id },
          {
            status: r.status,
            gateway: r.gateway,
            providerMessageId: r.providerMessageId,
            error: r.error,
            sentAt: r.status === SmsMessageStatus.Sent ? sentAt : null,
          },
        );
      }
    });
  }

  /** Changes the batch only if it is still in `from`; undefined otherwise. */
  private transition(
    id: string,
    from: SmsBatchStatus,
    set: BatchTransition,
  ): Promise<SmsBatch | undefined> {
    return this.db.tenant(async (m) => {
      const { affected } = await m.update(
        SmsBatchEntity,
        { id, status: from },
        set,
      );
      if (!affected) return undefined;
      const row = await m.findOneByOrFail(SmsBatchEntity, { id });
      return SmsBatchMapper.toDomain(row);
    });
  }
}
