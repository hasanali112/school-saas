import { SmsLedgerKind } from '../domain/sms';
import type { SmsLedgerEntry } from '../domain/sms-balance';

export interface BalanceResponseDto {
  balancePaisa: number;
  ratePaisaPerSegment: number;
}

export class LedgerEntryResponseDto {
  readonly id: string;
  readonly kind: SmsLedgerKind;
  readonly amountPaisa: number;
  readonly balanceAfterPaisa: number;
  readonly batchId: string | null;
  readonly note: string | null;
  readonly actorId: string | null;
  readonly createdAt: Date;

  private constructor(row: SmsLedgerEntry) {
    this.id = row.id;
    this.kind = row.kind;
    this.amountPaisa = row.amountPaisa;
    this.balanceAfterPaisa = row.balanceAfterPaisa;
    this.batchId = row.batchId;
    this.note = row.note;
    this.actorId = row.actorId;
    this.createdAt = row.createdAt;
  }

  static fromMany(rows: readonly SmsLedgerEntry[]): LedgerEntryResponseDto[] {
    return rows.map((row) => new LedgerEntryResponseDto(row));
  }
}
