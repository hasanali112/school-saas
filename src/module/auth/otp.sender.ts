import { Injectable } from '@nestjs/common';
import { SmsService } from '@modules/sms/sms.service';
import { OTP_TTL_SECONDS } from './auth.constants';

export const OTP_SENDER = Symbol('OTP_SENDER');

/** Kept as a port so tests and future channels (WhatsApp, app push) can replace SMS. */
export interface OtpSender {
  send(phone: string, code: string): Promise<void>;
}

const OTP_TTL_MINUTES = OTP_TTL_SECONDS / 60;

@Injectable()
export class SmsOtpSender implements OtpSender {
  constructor(private readonly sms: SmsService) {}

  async send(phone: string, code: string): Promise<void> {
    await this.sms.send(
      phone,
      `আপনার EduSmart লগইন কোড: ${code} (${OTP_TTL_MINUTES} মিনিটের জন্য বৈধ)`,
    );
  }
}
