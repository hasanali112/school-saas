import {
  IsEnum,
  IsISO8601,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { HolidayKind } from '../domain/holiday';

export class CreateHolidayDto {
  @IsISO8601({ strict: true })
  date: string;

  @IsString()
  @Length(1, 120)
  nameBn: string;

  @IsString()
  @Length(1, 120)
  nameEn: string;

  @IsEnum(HolidayKind)
  kind: HolidayKind;
}

export class HolidaysQueryDto {
  @IsOptional()
  @IsISO8601({ strict: true })
  from?: string;

  @IsOptional()
  @IsISO8601({ strict: true })
  to?: string;
}
