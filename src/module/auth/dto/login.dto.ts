import { IsString, Length, Matches } from 'class-validator';
import { BD_PHONE_MESSAGE, BD_PHONE_REGEX } from '@common/utils/phone/phone';

export class LoginDto {
  @IsString()
  @Length(2, 64)
  institutionSlug: string;

  @Matches(BD_PHONE_REGEX, { message: BD_PHONE_MESSAGE })
  phone: string;

  @IsString()
  @Length(1, 256)
  password: string;
}
