import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { BD_PHONE_MESSAGE, BD_PHONE_REGEX } from '@common/utils/phone/phone';
import { GuardianRelation } from '../domain/guardian';

/** Creates the guardian if the phone is new, otherwise links the existing one. */
export class LinkGuardianDto {
  @Matches(BD_PHONE_REGEX, { message: BD_PHONE_MESSAGE })
  phone: string;

  @IsString()
  @Length(1, 120)
  name: string;

  @IsEnum(GuardianRelation)
  relation: GuardianRelation;

  @IsOptional()
  @IsBoolean()
  isPrimary: boolean = false;
}
