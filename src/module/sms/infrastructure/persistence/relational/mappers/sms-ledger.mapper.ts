import type { SmsLedgerEntry } from '../../../../domain/sms-balance';
import { SmsLedgerEntity } from '../entities/sms-ledger.entity';

/** Converts between the `SmsLedgerEntry` domain type and its TypeORM row. */
export class SmsLedgerMapper {
  static toDomain(entity: SmsLedgerEntity): SmsLedgerEntry {
    return {
      id: entity.id,
      institutionId: entity.institutionId,
      kind: entity.kind,
      amountPaisa: entity.amountPaisa,
      balanceAfterPaisa: entity.balanceAfterPaisa,
      batchId: entity.batchId,
      note: entity.note,
      actorId: entity.actorId,
      createdAt: entity.createdAt,
    };
  }
}
