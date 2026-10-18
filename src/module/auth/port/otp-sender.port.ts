/** How login codes reach the user; SMS today, WhatsApp or app push later. */
export abstract class OtpSenderPort {
  abstract send(phone: string, code: string): Promise<void>;
}
