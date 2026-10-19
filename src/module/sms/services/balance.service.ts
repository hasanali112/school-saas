import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { smsConfig } from '@config/sms/sms.config';
import { AuditLogPort } from '@module/audit/application/ports/audit-log.port';
import type { AuthUser } from '@common/types/auth-user';
import type { BalanceView } from '../domain/sms-balance';
import { TopUpDto } from '../dto/balance.dto';
import {
  BalanceResponseDto,
  LedgerEntryResponseDto,
} from '../dto/balance.response.dto';
import { BalanceRepository } from '../application/ports/balance.repository.port';

/** 402 with the shortfall, so the UI can show exactly how much to top up (F1-12 acceptance). */
export class InsufficientBalanceException extends HttpException {
  constructor(readonly shortfallPaisa: number) {
    super(
      {
        message: `Insufficient SMS balance: short by ${shortfallPaisa} paisa`,
        shortfallPaisa,
      },
      HttpStatus.PAYMENT_REQUIRED,
    );
  }
}

/** Per-institution prepaid SMS balance (F1-12 §3). Money moves only through the ledger. */
@Injectable()
export class BalanceService {
  private readonly defaultRatePaisa: number;

  constructor(
    private readonly repo: BalanceRepository,
    private readonly audit: AuditLogPort,
    @Inject(smsConfig.KEY) sms: ConfigType<typeof smsConfig>,
  ) {
    this.defaultRatePaisa = sms.segmentCostPaisa;
  }

  async get(): Promise<BalanceView> {
    const row = await this.repo.find();
    return {
      balancePaisa: row?.balancePaisa ?? 0,
      ratePaisaPerSegment: row?.ratePaisaPerSegment ?? this.defaultRatePaisa,
    };
  }

  async topUp(dto: TopUpDto, actor: AuthUser): Promise<BalanceResponseDto> {
    const row = await this.repo.topUp(dto.amountPaisa, actor.id, dto.note);
    await this.audit.record({
      actorId: actor.id,
      action: 'sms.balance.topped_up',
      entity: 'sms_balance',
      after: { amountPaisa: dto.amountPaisa, balancePaisa: row.balancePaisa },
      reason: dto.note,
    });
    return {
      balancePaisa: row.balancePaisa,
      ratePaisaPerSegment: row.ratePaisaPerSegment ?? this.defaultRatePaisa,
    };
  }

  /** Debits the batch cost or throws 402; returns the balance after the charge. */
  async charge(
    batchId: string,
    costPaisa: number,
    actorId: string,
  ): Promise<number> {
    const row = await this.repo.debit(costPaisa, batchId, actorId);
    if (row) return row.balancePaisa;
    const { balancePaisa } = await this.get();
    throw new InsufficientBalanceException(costPaisa - balancePaisa);
  }

  async refund(batchId: string, costPaisa: number): Promise<void> {
    if (costPaisa <= 0) return;
    await this.repo.refund(costPaisa, batchId);
  }

  async ledger(
    limit: number,
    offset: number,
  ): Promise<LedgerEntryResponseDto[]> {
    return LedgerEntryResponseDto.fromMany(
      await this.repo.findLedger(limit, offset),
    );
  }
}
