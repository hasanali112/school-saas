import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { ConsentPurpose, ConsentSource } from '../domain/consent';

export class RecordConsentDto {
  @IsEnum(ConsentPurpose)
  purpose: ConsentPurpose;

  @IsBoolean()
  granted: boolean;

  @IsEnum(ConsentSource)
  source: ConsentSource;

  /** Paper form reference or how the consent was obtained. */
  @IsOptional()
  @IsString()
  @Length(1, 300)
  note?: string;
}
