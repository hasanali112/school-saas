import { Injectable } from '@nestjs/common';
import { SmsService } from '@module/sms/services/sms.service';
import { OTP_TTL_SECONDS } from '../../domain/auth.constants';
import { OtpSenderPort } from '../../application/ports/otp-sender.port';

const OTP_TTL_MINUTES = OTP_TTL_SECONDS / 60;

/** Login codes are transactional: sent at once, never drafted (CLAUDE.md, SMS). */
@Injectable()
export class SmsOtpSender implements OtpSenderPort {
  constructor(private readonly sms: SmsService) {}

  async send(phone: string, code: string): Promise<void> {
    await this.sms.send(
      phone,
      `আপনার EduSmart লগইন কোড: ${code} (${OTP_TTL_MINUTES} মিনিটের জন্য বৈধ)`,
    );
  }
}
