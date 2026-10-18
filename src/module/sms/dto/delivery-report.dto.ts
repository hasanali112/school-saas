import { IsEnum, IsOptional, IsString, Length } from 'class-validator';

export const DeliveryStatus = {
  Delivered: 'delivered',
  Failed: 'failed',
} as const;
export type DeliveryStatus =
  (typeof DeliveryStatus)[keyof typeof DeliveryStatus];

/** Generic callback shape; vendor adapters translate their DLR format into this (open question in F1-12). */
export class DeliveryReportDto {
  @IsString()
  @Length(1, 200)
  providerMessageId: string;

  @IsEnum(DeliveryStatus)
  status: DeliveryStatus;

  @IsOptional()
  @IsString()
  @Length(1, 300)
  error?: string;
}
