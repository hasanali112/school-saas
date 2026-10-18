import { Inject, Injectable } from '@nestjs/common';
import { SMS_GATEWAY, SmsDelivery } from './gateway/sms.gateway';
import type { SmsGateway } from './gateway/sms.gateway';

/**
 * Raw single-message send for transactional traffic that must not sit in a draft
 * (login OTPs). Everything guardian-facing goes through BatchesService instead so
 * consent, cost and the delivery log apply.
 */
@Injectable()
export class SmsService {
  constructor(@Inject(SMS_GATEWAY) private readonly gateway: SmsGateway) {}

  send(phone: string, message: string): Promise<SmsDelivery> {
    return this.gateway.send(phone, message);
  }
}
