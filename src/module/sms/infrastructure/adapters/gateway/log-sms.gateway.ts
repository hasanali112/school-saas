import { Logger, ServiceUnavailableException } from '@nestjs/common';
import type { SmsDelivery } from '../../../domain/sms';
import { SmsGatewayPort } from '../../../application/ports/sms-gateway.port';

/** Development stand-in: logs instead of sending. Refuses in production so a missing gateway is loud. */
export class LogSmsGateway implements SmsGatewayPort {
  static readonly NAME = 'log';
  private readonly logger = new Logger(LogSmsGateway.name);

  constructor(private readonly isProduction: boolean) {}

  send(phone: string, message: string): Promise<SmsDelivery> {
    if (this.isProduction) {
      throw new ServiceUnavailableException('SMS delivery is not configured');
    }
    this.logger.warn(`SMS to ${phone}: ${message}`);
    return Promise.resolve({ gateway: LogSmsGateway.NAME });
  }
}
