import { Type } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  ValidateNested,
} from 'class-validator';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { SmsBatchStatus, SmsPurpose } from '../domain/sms';
import { AudienceDto } from './audience.dto';
import { TEMPLATE_KEY_PATTERN } from './template.dto';

/** Ten Unicode parts; the preview shows the real segment count before anything is sent. */
const MAX_MESSAGE_LENGTH = 670;

/** Exactly one of `message` / `templateKey` (checked in the service). */
export class ComposeDto {
  @IsEnum(SmsPurpose)
  purpose: SmsPurpose;

  @IsOptional()
  @IsString()
  @Length(1, MAX_MESSAGE_LENGTH)
  message?: string;

  @IsOptional()
  @Matches(TEMPLATE_KEY_PATTERN)
  templateKey?: string;

  @ValidateNested()
  @Type(() => AudienceDto)
  audience: AudienceDto;

  /** Defaults to the current session. */
  @IsOptional()
  @IsUUID()
  sessionId?: string;
}

export class ListBatchesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(SmsBatchStatus)
  status?: SmsBatchStatus;

  @IsOptional()
  @IsEnum(SmsPurpose)
  purpose?: SmsPurpose;
}
