import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
} from 'class-validator';

export const LeaveAppliesTo = {
  Staff: 'staff',
  Student: 'student',
  Both: 'both',
} as const;
export type LeaveAppliesTo =
  (typeof LeaveAppliesTo)[keyof typeof LeaveAppliesTo];

export enum LeaveStatus {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
  Cancelled = 'cancelled',
}

export enum ApplicantKind {
  Staff = 'staff',
  Student = 'student',
}

const MAX_DAYS_PER_YEAR = 366;

export class CreateLeaveTypeDto {
  @IsString()
  @Length(1, 60)
  name: string;

  @IsOptional()
  @IsEnum(LeaveAppliesTo)
  appliesTo: LeaveAppliesTo = LeaveAppliesTo.Both;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_DAYS_PER_YEAR)
  maxDaysPerYear?: number;
}

/** Staff apply for themselves; a teacher or the office applies on behalf of a student by passing studentId. */
export class ApplyLeaveDto {
  @IsUUID()
  leaveTypeId: string;

  @IsOptional()
  @IsUUID()
  studentId?: string;

  @IsISO8601({ strict: true })
  fromDate: string;

  @IsISO8601({ strict: true })
  toDate: string;

  @IsString()
  @Length(3, 500)
  reason: string;
}

export class DecideLeaveDto {
  @IsOptional()
  @IsString()
  @Length(1, 500)
  note?: string;
}

export class ListLeaveQueryDto {
  @IsOptional()
  @IsEnum(LeaveStatus)
  status?: LeaveStatus;

  @IsOptional()
  @IsEnum(ApplicantKind)
  kind?: ApplicantKind;
}
