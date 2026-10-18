import { IsString, Length, Matches } from 'class-validator';

/** Room for a long concatenated Bangla notice; the preview shows the segment count. */
const MAX_TEMPLATE_LENGTH = 1000;

export const TEMPLATE_KEY_PATTERN = /^[a-z][a-z0-9_]{1,39}$/;

export class UpsertTemplateDto {
  @IsString()
  @Length(1, 80)
  name: string;

  @IsString()
  @Length(1, MAX_TEMPLATE_LENGTH)
  body: string;
}

export class TemplateKeyDto {
  @Matches(TEMPLATE_KEY_PATTERN)
  key: string;
}
