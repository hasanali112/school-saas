export const SMS_GATEWAY = Symbol('SMS_GATEWAY');

export interface SmsDelivery {
  /** Provider-side id when available; delivery reports are matched on it. */
  providerMessageId?: string;
  /** Which adapter delivered (`primary`, `secondary`, `log`), kept on the message log. */
  gateway: string;
}

/** Port implemented by every provider adapter; the rest of the module only knows this. */
export interface SmsGateway {
  send(phone: string, message: string): Promise<SmsDelivery>;
}
