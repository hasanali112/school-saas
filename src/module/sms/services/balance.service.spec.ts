import { HttpStatus } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthUser } from '@common/types/auth-user';
import { Role } from '@common/types/role';
import { smsConfig } from '@config/sms/sms.config';
import type { SmsBalance } from '../domain/sms-balance';
import { AuditLogPort } from '@module/audit/application/ports/audit-log.port';
import type { AuditEntry } from '@module/audit/domain/audit-entry';
import { createMock, getMock } from '@test/utils/create-mock';
import { containing } from '@test/utils/matchers';
import { BalanceRepository } from '../application/ports/balance.repository.port';
import {
  BalanceService,
  InsufficientBalanceException,
} from './balance.service';

const actor: AuthUser = {
  id: 'head',
  institutionId: 'inst-1',
  roles: [Role.InstituteHead],
};
const balance = (overrides: Partial<SmsBalance> = {}): SmsBalance => ({
  institutionId: 'inst-1',
  balancePaisa: 1000,
  ratePaisaPerSegment: null,
  updatedAt: new Date('2026-09-01'),
  ...overrides,
});

describe('BalanceService', () => {
  let service: BalanceService;
  let repo: jest.Mocked<BalanceRepository>;
  let audit: jest.Mocked<AuditLogPort>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        BalanceService,
        { provide: smsConfig.KEY, useValue: { segmentCostPaisa: 30 } },
      ],
    })
      .useMocker(createMock)
      .compile();
    service = moduleRef.get(BalanceService);
    repo = getMock(moduleRef, BalanceRepository);
    audit = getMock(moduleRef, AuditLogPort);
  });

  it('reports a zero balance at the platform rate for an institution with no row yet', async () => {
    repo.find.mockResolvedValue(undefined);
    await expect(service.get()).resolves.toEqual({
      balancePaisa: 0,
      ratePaisaPerSegment: 30,
    });
  });

  it('prefers the institution rate over the platform default', async () => {
    repo.find.mockResolvedValue(balance({ ratePaisaPerSegment: 25 }));
    await expect(service.get()).resolves.toEqual({
      balancePaisa: 1000,
      ratePaisaPerSegment: 25,
    });
  });

  it('tops up through the ledger and audits it as a financial change', async () => {
    repo.topUp.mockResolvedValue(balance({ balancePaisa: 6000 }));

    const result = await service.topUp(
      { amountPaisa: 5000, note: 'cash pack' },
      actor,
    );

    expect(repo.topUp).toHaveBeenCalledWith(5000, 'head', 'cash pack');
    expect(result.balancePaisa).toBe(6000);
    expect(audit.record).toHaveBeenCalledWith(
      containing<AuditEntry>({
        action: 'sms.balance.topped_up',
        after: { amountPaisa: 5000, balancePaisa: 6000 },
      }),
    );
  });

  it('charges a batch atomically and returns the new balance', async () => {
    repo.debit.mockResolvedValue(balance({ balancePaisa: 400 }));
    await expect(service.charge('b1', 600, 'head')).resolves.toBe(400);
    expect(repo.debit).toHaveBeenCalledWith(600, 'b1', 'head');
  });

  it('refuses with 402 and the shortfall when the balance is insufficient', async () => {
    repo.debit.mockResolvedValue(undefined);
    repo.find.mockResolvedValue(balance({ balancePaisa: 100 }));

    const error = await service
      .charge('b1', 600, 'head')
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(InsufficientBalanceException);
    expect((error as InsufficientBalanceException).getStatus()).toBe(
      HttpStatus.PAYMENT_REQUIRED,
    );
    expect((error as InsufficientBalanceException).getResponse()).toEqual({
      message: 'Insufficient SMS balance: short by 500 paisa',
      shortfallPaisa: 500,
    });
  });

  it('refunds nothing when no messages failed', async () => {
    await service.refund('b1', 0);
    expect(repo.refund).not.toHaveBeenCalled();
  });

  it('refunds the failed messages cost to the ledger', async () => {
    await service.refund('b1', 90);
    expect(repo.refund).toHaveBeenCalledWith(90, 'b1');
  });
});
