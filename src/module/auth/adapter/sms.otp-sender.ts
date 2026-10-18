import { Injectable } from '@nestjs/common';
import { SmsFacade } from '@module/sms/service/sms.facade';
import { OTP_TTL_SECONDS } from '../domain/auth.constants';
import { OtpSenderPort } from '../port/otp-sender.port';

const OTP_TTL_MINUTES = OTP_TTL_SECONDS / 60;

/** Login codes are transactional: sent at once, never drafted (CLAUDE.md, SMS). */
@Injectable()
export class SmsOtpSender implements OtpSenderPort {
  constructor(private readonly sms: SmsFacade) {}

  async send(phone: string, code: string): Promise<void> {
    await this.sms.sendTransactional(
      phone,
      `আপনার EduSmart লগইন কোড: ${code} (${OTP_TTL_MINUTES} মিনিটের জন্য বৈধ)`,
    );
  }
}
