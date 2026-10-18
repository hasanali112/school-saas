import { Injectable } from '@nestjs/common';
import type { SmsDelivery } from '../domain/sms';
import { SmsGatewayPort } from '../port/sms-gateway.port';

/**
 * Raw single-message send for transactional traffic that must not sit in a draft
 * (login OTPs). Everything guardian-facing goes through BatchesService instead so
 * consent, cost and the delivery log apply.
 */
@Injectable()
export class SmsService {
  constructor(private readonly gateway: SmsGatewayPort) {}

  send(phone: string, message: string): Promise<SmsDelivery> {
    return this.gateway.send(phone, message);
  }
}
