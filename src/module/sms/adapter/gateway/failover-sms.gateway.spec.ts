import { ServiceUnavailableException } from '@nestjs/common';
import { createMock } from '@test/utils/create-mock';
import { FailoverSmsGateway } from './failover-sms.gateway';
import { SmsGatewayPort } from '../../port/sms-gateway.port';

describe('FailoverSmsGateway', () => {
  let primary: jest.Mocked<SmsGatewayPort>;
  let secondary: jest.Mocked<SmsGatewayPort>;

  beforeEach(() => {
    primary = createMock<SmsGatewayPort>();
    secondary = createMock<SmsGatewayPort>();
  });

  it('delivers through the primary and never touches the secondary when it succeeds', async () => {
    primary.send.mockResolvedValue({
      providerMessageId: 'p1',
      gateway: 'primary',
    });

    const result = await new FailoverSmsGateway(primary, secondary).send(
      '01700000000',
      'hi',
    );

    expect(result).toEqual({ providerMessageId: 'p1', gateway: 'primary' });
    expect(secondary.send).not.toHaveBeenCalled();
  });

  it('falls back to the secondary when the primary fails and reports which one delivered', async () => {
    primary.send.mockRejectedValue(new ServiceUnavailableException());
    secondary.send.mockResolvedValue({
      providerMessageId: 's1',
      gateway: 'secondary',
    });

    const result = await new FailoverSmsGateway(primary, secondary).send(
      '01700000000',
      'hi',
    );

    expect(result).toEqual({ providerMessageId: 's1', gateway: 'secondary' });
    expect(secondary.send).toHaveBeenCalledWith('01700000000', 'hi');
  });

  it('throws 503 when every gateway fails', async () => {
    primary.send.mockRejectedValue(new Error('down'));
    secondary.send.mockRejectedValue(new Error('down too'));

    await expect(
      new FailoverSmsGateway(primary, secondary).send('01700000000', 'hi'),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('works with only a primary configured', async () => {
    primary.send.mockRejectedValue(new Error('down'));
    await expect(
      new FailoverSmsGateway(primary).send('01700000000', 'hi'),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
