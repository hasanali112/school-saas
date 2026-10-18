import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  Matches,
  MinLength,
} from 'class-validator';
import { Role } from '@modules/auth/roles';
import { BD_PHONE_MESSAGE, BD_PHONE_REGEX } from '@common/utils/phone/phone';

const PASSWORD_MIN = 8;

export class CreateUserDto {
  @Matches(BD_PHONE_REGEX, { message: BD_PHONE_MESSAGE })
  phone: string;

  @IsString()
  @Length(1, 120)
  name: string;

  /** Omit for OTP-only accounts such as guardians. */
  @IsOptional()
  @IsString()
  @MinLength(PASSWORD_MIN)
  password?: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(Role, { each: true })
  roles: Role[];
}
