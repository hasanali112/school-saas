import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { DatabaseService } from '@common/services/database/database.service';
import { currentInstitutionId } from '@common/services/database/tenant-context';
import { SmsLedgerKind } from '../domain/sms';
import type { SmsBalance, SmsLedgerEntry } from '../domain/sms-balance';
import { BalanceRepositoryPort } from '../port/balance.repository.port';
import { SmsBalanceEntity } from './entities/sms-balance.entity';
import { SmsLedgerEntity } from './entities/sms-ledger.entity';

/** Optional columns of a ledger line. */
interface LedgerExtra {
  batchId?: string;
  actorId?: string;
  note?: string;
}

@Injectable()
export class BalanceRepository implements BalanceRepositoryPort {
  constructor(private readonly db: DatabaseService) {}

  async find(): Promise<SmsBalance | undefined> {
    const institutionId = currentInstitutionId();
    return (
      (await this.db.tenant((m) =>
        m.findOneBy(SmsBalanceEntity, { institutionId }),
      )) ?? undefined
    );
  }

  topUp(
    amountPaisa: number,
    actorId: string,
    note?: string,
  ): Promise<SmsBalance> {
    const institutionId = currentInstitutionId();
    return this.db.tenant(async (m) => {
      // Create the row on the first top-up; the add below is then the same for both cases.
      await m
        .createQueryBuilder()
        .insert()
        .into(SmsBalanceEntity)
        .values({ institutionId, balancePaisa: 0 })
        .orIgnore()
        .execute();
      await this.add(m, institutionId, amountPaisa);
      const row = await m.findOneByOrFail(SmsBalanceEntity, { institutionId });
      await this.appendLedger(m, SmsLedgerKind.TopUp, amountPaisa, row, {
        actorId,
        note,
      });
      return row;
    });
  }

  debit(
    amountPaisa: number,
    batchId: string,
    actorId: string,
  ): Promise<SmsBalance | undefined> {
    const institutionId = currentInstitutionId();
    return this.db.tenant(async (m) => {
      const { affected } = await m
        .createQueryBuilder()
        .update(SmsBalanceEntity)
        .set({ balancePaisa: () => 'balance_paisa - :amount' })
        .where('institution_id = :institutionId', { institutionId })
        .andWhere('balance_paisa >= :amount')
        .setParameter('amount', amountPaisa)
        .execute();
      if (!affected) return undefined;
      const row = await m.findOneByOrFail(SmsBalanceEntity, { institutionId });
      await this.appendLedger(m, SmsLedgerKind.Send, -amountPaisa, row, {
        batchId,
        actorId,
      });
      return row;
    });
  }

  refund(amountPaisa: number, batchId: string): Promise<SmsBalance> {
    const institutionId = currentInstitutionId();
    return this.db.tenant(async (m) => {
      await this.add(m, institutionId, amountPaisa);
      const row = await m.findOneByOrFail(SmsBalanceEntity, { institutionId });
      await this.appendLedger(m, SmsLedgerKind.Refund, amountPaisa, row, {
        batchId,
      });
      return row;
    });
  }

  findLedger(limit: number, offset: number): Promise<SmsLedgerEntry[]> {
    return this.db.tenant((m) =>
      m.find(SmsLedgerEntity, {
        order: { createdAt: 'DESC' },
        take: limit,
        skip: offset,
      }),
    );
  }

  /** Atomic `balance += amount` in SQL, so concurrent sends never lose an update. */
  private async add(
    m: EntityManager,
    institutionId: string,
    amountPaisa: number,
  ): Promise<void> {
    await m
      .createQueryBuilder()
      .update(SmsBalanceEntity)
      .set({ balancePaisa: () => 'balance_paisa + :amount' })
      .where('institution_id = :institutionId', { institutionId })
      .setParameter('amount', amountPaisa)
      .execute();
  }

  private async appendLedger(
    m: EntityManager,
    kind: SmsLedgerKind,
    amountPaisa: number,
    balance: SmsBalance,
    extra: LedgerExtra,
  ): Promise<void> {
    await m.insert(SmsLedgerEntity, {
      institutionId: balance.institutionId,
      kind,
      amountPaisa,
      balanceAfterPaisa: balance.balancePaisa,
      batchId: extra.batchId ?? null,
      actorId: extra.actorId ?? null,
      note: extra.note ?? null,
    });
  }
}
