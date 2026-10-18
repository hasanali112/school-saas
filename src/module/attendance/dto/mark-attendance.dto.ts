import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { AttendanceStatus, DAILY_PERIOD } from '../domain/attendance';

const MAX_PERIOD = 12;
const MAX_ENTRIES = 500;

export class AttendanceEntryDto {
  @IsUUID()
  enrolmentId: string;

  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;
}

export class MarkAttendanceDto {
  @IsOptional()
  @IsUUID()
  sessionId?: string;

  @IsISO8601({ strict: true })
  date: string;

  /** 0 = once daily (default); 1..12 = per period. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(MAX_PERIOD)
  period: number = DAILY_PERIOD;

  /** Required when marking a past date (admin only); stored in the audit log. */
  @IsOptional()
  @IsString()
  @Length(3, 500)
  reason?: string;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(MAX_ENTRIES)
  @ValidateNested({ each: true })
  @Type(() => AttendanceEntryDto)
  entries: AttendanceEntryDto[];
}

export class AttendanceSheetQueryDto {
  @IsOptional()
  @IsUUID()
  sessionId?: string;

  @IsISO8601({ strict: true })
  date: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(MAX_PERIOD)
  period: number = DAILY_PERIOD;
}

export class MonthQueryDto {
  @IsOptional()
  @IsUUID()
  sessionId?: string;

  /** YYYY-MM */
  @IsString()
  @Length(7, 7)
  month: string;
}

export class StaffAttendanceEntryDto {
  @IsUUID()
  userId: string;

  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;
}

export class MarkStaffAttendanceDto {
  @IsISO8601({ strict: true })
  date: string;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(MAX_ENTRIES)
  @ValidateNested({ each: true })
  @Type(() => StaffAttendanceEntryDto)
  entries: StaffAttendanceEntryDto[];
}

export class DateQueryDto {
  @IsISO8601({ strict: true })
  date: string;
}
