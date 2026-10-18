import { Logger, ServiceUnavailableException } from '@nestjs/common';
import { SmsDelivery, SmsGateway } from './sms.gateway';

/**
 * Tries the primary gateway and, if it throws, the secondary (F1-12 §1). The
 * delivery names the adapter that succeeded so the log shows which one delivered.
 */
export class FailoverSmsGateway implements SmsGateway {
  private readonly logger = new Logger(FailoverSmsGateway.name);

  constructor(
    private readonly primary: SmsGateway,
    private readonly secondary?: SmsGateway,
  ) {}

  async send(phone: string, message: string): Promise<SmsDelivery> {
    try {
      return await this.primary.send(phone, message);
    } catch (primaryError) {
      if (!this.secondary) throw this.toUnavailable(primaryError);
      this.logger.warn(
        `Primary SMS gateway failed for ${phone}; using secondary`,
      );
      try {
        return await this.secondary.send(phone, message);
      } catch (secondaryError) {
        throw this.toUnavailable(secondaryError);
      }
    }
  }

  private toUnavailable(error: unknown): ServiceUnavailableException {
    return error instanceof ServiceUnavailableException
      ? error
      : new ServiceUnavailableException('SMS delivery failed on every gateway');
  }
}
