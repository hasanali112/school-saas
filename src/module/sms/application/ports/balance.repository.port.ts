import type { SmsBalance, SmsLedgerEntry } from '../../domain/sms-balance';

/** Balance and ledger always move in one transaction. */
export abstract class BalanceRepository {
  abstract find(): Promise<SmsBalance | undefined>;
  /** Creates the balance row on first top-up. */
  abstract topUp(
    amountPaisa: number,
    actorId: string,
    note?: string,
  ): Promise<SmsBalance>;
  /** Conditional debit: nothing changes when the balance is short, so two sends cannot both pass. */
  abstract debit(
    amountPaisa: number,
    batchId: string,
    actorId: string,
  ): Promise<SmsBalance | undefined>;
  abstract refund(amountPaisa: number, batchId: string): Promise<SmsBalance>;
  abstract findLedger(limit: number, offset: number): Promise<SmsLedgerEntry[]>;
}
