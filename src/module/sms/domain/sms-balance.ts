import type { SmsLedgerKind } from './sms';

/** Current prepaid balance of an institution; debited atomically on send. */
export interface SmsBalance {
  institutionId: string;
  balancePaisa: number;
  /** Null = the platform default (SMS_SEGMENT_COST_PAISA). */
  ratePaisaPerSegment: number | null;
  updatedAt: Date;
}

/** Append-only history behind the balance: top-ups, sends, refunds for failed messages. */
export interface SmsLedgerEntry {
  id: string;
  institutionId: string;
  kind: SmsLedgerKind;
  /** Signed: top-ups positive, sends negative. */
  amountPaisa: number;
  balanceAfterPaisa: number;
  batchId: string | null;
  note: string | null;
  actorId: string | null;
  createdAt: Date;
}

/** Balance and the rate actually charged per segment. */
export interface BalanceView {
  balancePaisa: number;
  ratePaisaPerSegment: number;
}
