import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';

/** BDT 1,00,000 per top-up; larger packs come through billing (F1-01). */
const MAX_TOP_UP_PAISA = 10_000_000;

export class TopUpDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_TOP_UP_PAISA)
  amountPaisa: number;

  @IsOptional()
  @IsString()
  @Length(1, 200)
  note?: string;
}
