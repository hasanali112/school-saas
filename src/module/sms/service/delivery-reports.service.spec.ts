import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { smsConfig } from '@config/sms/sms.config';
import { createMock, getMock } from '@test/utils/create-mock';
import { DeliveryReportsRepositoryPort } from '../port/delivery-reports.repository.port';
import { DeliveryReportsService } from './delivery-reports.service';
import { DeliveryStatus } from '../domain/sms';

async function build(secret?: string) {
  const moduleRef = await Test.createTestingModule({
    providers: [
      DeliveryReportsService,
      { provide: smsConfig.KEY, useValue: { deliveryReportSecret: secret } },
    ],
  })
    .useMocker(createMock)
    .compile();
  return {
    service: moduleRef.get(DeliveryReportsService),
    repo: getMock(moduleRef, DeliveryReportsRepositoryPort),
  };
}

describe('DeliveryReportsService', () => {
  it('rejects a callback whose secret does not match', async () => {
    const { service, repo } = await build('correct-horse-battery-staple');
    await expect(
      service.record('wrong', {
        providerMessageId: 'p1',
        status: DeliveryStatus.Delivered,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(repo.applyReport).not.toHaveBeenCalled();
  });

  it('rejects every callback when no secret is configured', async () => {
    const { service } = await build(undefined);
    await expect(
      service.record('anything', {
        providerMessageId: 'p1',
        status: DeliveryStatus.Delivered,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('marks the message delivered when the secret matches', async () => {
    const { service, repo } = await build('correct-horse-battery-staple');
    repo.applyReport.mockResolvedValue(true);

    await service.record('correct-horse-battery-staple', {
      providerMessageId: 'p1',
      status: DeliveryStatus.Delivered,
    });

    expect(repo.applyReport).toHaveBeenCalledWith('p1', 'delivered', undefined);
  });

  it('404s an unknown provider id so the provider stops retrying', async () => {
    const { service, repo } = await build('correct-horse-battery-staple');
    repo.applyReport.mockResolvedValue(false);
    await expect(
      service.record('correct-horse-battery-staple', {
        providerMessageId: 'nope',
        status: DeliveryStatus.Failed,
        error: 'absent subscriber',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
