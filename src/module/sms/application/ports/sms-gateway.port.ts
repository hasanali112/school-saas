import type { SmsDelivery } from '../../domain/sms';

/** Implemented by every provider adapter; the rest of the module only knows this. */
export abstract class SmsGatewayPort {
  abstract send(phone: string, message: string): Promise<SmsDelivery>;
}
