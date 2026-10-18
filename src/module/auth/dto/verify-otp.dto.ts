import { Matches } from 'class-validator';
import { OTP_LENGTH } from '../auth.constants';
import { RequestOtpDto } from './request-otp.dto';

export class VerifyOtpDto extends RequestOtpDto {
  @Matches(new RegExp(`^\\d{${OTP_LENGTH}}$`), {
    message: `code must be ${OTP_LENGTH} digits`,
  })
  code: string;
}
