import type { Page } from '@common/types/paginated';
import type {
  BatchFilter,
  DraftMessage,
  FinishPatch,
  MessageResult,
  NewSmsBatch,
  SmsBatch,
  SmsMessage,
} from '../../domain/sms-batch';

export abstract class BatchesRepository {
  /** Batch and its messages land together so a half-written draft never exists. */
  abstract insertDraft(
    batch: NewSmsBatch,
    messages: readonly DraftMessage[],
  ): Promise<SmsBatch>;
  abstract findById(id: string): Promise<SmsBatch | undefined>;
  abstract findByDedupeKey(key: string): Promise<SmsBatch | undefined>;
  abstract findPage(
    filter: BatchFilter,
    limit: number,
    offset: number,
  ): Promise<Page<SmsBatch>>;
  abstract findMessages(batchId: string): Promise<SmsMessage[]>;
  /** draft → sending, only if still a draft: the guard against two officers pressing send. */
  abstract markSending(id: string): Promise<SmsBatch | undefined>;
  abstract revertToDraft(id: string): Promise<SmsBatch | undefined>;
  abstract cancel(id: string): Promise<SmsBatch | undefined>;
  abstract finish(
    id: string,
    patch: FinishPatch,
  ): Promise<SmsBatch | undefined>;
  abstract deleteDraft(id: string): Promise<void>;
  abstract recordResults(results: readonly MessageResult[]): Promise<void>;
}
