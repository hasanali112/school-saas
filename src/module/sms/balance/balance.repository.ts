import { Injectable } from '@nestjs/common';
import { and, desc, eq, gte, sql } from 'drizzle-orm';
import { DatabaseService } from '@database/database.service';
import type { Tx } from '@database/database.service';
import { currentInstitutionId } from '@database/tenant-context';
import {
  SmsBalanceRow,
  smsBalances,
  SmsLedgerRow,
  smsLedger,
} from '@database/schema';

@Injectable()
export class BalanceRepository {
  constructor(private readonly database: DatabaseService) {}

  find(): Promise<SmsBalanceRow | undefined> {
    return this.database.tenant((tx) => tx.query.smsBalances.findFirst());
  }

  /** Creates the balance row on first top-up; balance and ledger move in one transaction. */
  topUp(
    amountPaisa: number,
    actorId: string,
    note?: string,
  ): Promise<SmsBalanceRow> {
    return this.database.tenant(async (tx) => {
      const institutionId = currentInstitutionId();
      const [row] = await tx
        .insert(smsBalances)
        .values({ institutionId, balancePaisa: amountPaisa })
        .onConflictDoUpdate({
          target: smsBalances.institutionId,
          set: {
            balancePaisa: sql`${smsBalances.balancePaisa} + ${amountPaisa}`,
            updatedAt: new Date(),
          },
        })
        .returning();
      await this.appendLedger(tx, 'top_up', amountPaisa, row, {
        actorId,
        note,
      });
      return row;
    });
  }

  /** Conditional debit: no row is updated when the balance is short, so two sends cannot both pass. */
  debit(
    amountPaisa: number,
    batchId: string,
    actorId: string,
  ): Promise<SmsBalanceRow | undefined> {
    return this.database.tenant(async (tx) => {
      const [row] = await tx
        .update(smsBalances)
        .set({
          balancePaisa: sql`${smsBalances.balancePaisa} - ${amountPaisa}`,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(smsBalances.institutionId, currentInstitutionId()),
            gte(smsBalances.balancePaisa, amountPaisa),
          ),
        )
        .returning();
      if (!row) return undefined;
      await this.appendLedger(tx, 'send', -amountPaisa, row, {
        batchId,
        actorId,
      });
      return row;
    });
  }

  refund(amountPaisa: number, batchId: string): Promise<SmsBalanceRow> {
    return this.database.tenant(async (tx) => {
      const [row] = await tx
        .update(smsBalances)
        .set({
          balancePaisa: sql`${smsBalances.balancePaisa} + ${amountPaisa}`,
          updatedAt: new Date(),
        })
        .where(eq(smsBalances.institutionId, currentInstitutionId()))
        .returning();
      await this.appendLedger(tx, 'refund', amountPaisa, row, { batchId });
      return row;
    });
  }

  findLedger(limit: number, offset: number): Promise<SmsLedgerRow[]> {
    return this.database.tenant((tx) =>
      tx
        .select()
        .from(smsLedger)
        .orderBy(desc(smsLedger.createdAt))
        .limit(limit)
        .offset(offset),
    );
  }

  private async appendLedger(
    tx: Tx,
    kind: SmsLedgerRow['kind'],
    amountPaisa: number,
    balance: SmsBalanceRow,
    extra: { batchId?: string; actorId?: string; note?: string },
  ): Promise<void> {
    await tx.insert(smsLedger).values({
      institutionId: balance.institutionId,
      kind,
      amountPaisa,
      balanceAfterPaisa: balance.balancePaisa,
      ...extra,
    });
  }
}
