import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export const ConsentPurpose = {
  Sms: 'sms',
  App: 'app',
  AiProcessing: 'ai_processing',
  Photo: 'photo',
} as const;
export type ConsentPurpose =
  (typeof ConsentPurpose)[keyof typeof ConsentPurpose];

export enum ConsentSource {
  App = 'app',
  Paper = 'paper',
  Phone = 'phone',
  Office = 'office',
}

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
