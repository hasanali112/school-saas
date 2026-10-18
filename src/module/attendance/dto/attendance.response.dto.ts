import { AttendanceStatus } from '../domain/attendance';
import type { DayStatuses, StatusCounts } from '../domain/attendance';

export class SheetEntryDto {
  constructor(
    readonly enrolmentId: string,
    readonly studentId: string,
    readonly rollNo: number,
    readonly nameBn: string,
    readonly nameEn: string,
    /** Null when nothing has been marked yet for this date/period. */
    readonly status: AttendanceStatus | null,
  ) {}
}

export class AttendanceSheetDto {
  constructor(
    readonly sectionId: string,
    readonly sessionId: string,
    readonly date: string,
    readonly period: number,
    readonly isHoliday: boolean,
    readonly entries: SheetEntryDto[],
  ) {}
}

/** Staff marking only reports how many rows were written. */
export class MarkedCountDto {
  constructor(readonly marked: number) {}
}

export class MarkResultDto {
  constructor(
    readonly date: string,
    readonly period: number,
    readonly marked: number,
    readonly counts: StatusCounts,
    readonly backdated: boolean,
  ) {}
}

export class RegisterRowDto {
  constructor(
    readonly enrolmentId: string,
    readonly rollNo: number,
    readonly nameBn: string,
    readonly nameEn: string,
    /** ISO date → status, only for dates with a record. */
    readonly days: DayStatuses,
    readonly presentDays: number,
  ) {}
}

export class MonthlyRegisterDto {
  constructor(
    readonly sectionId: string,
    readonly month: string,
    /** Dates on which attendance was taken at least once. */
    readonly workingDays: string[],
    readonly rows: RegisterRowDto[],
  ) {}
}

export class MonthlySummaryRowDto {
  constructor(
    readonly studentId: string,
    readonly rollNo: number,
    readonly nameBn: string,
    readonly nameEn: string,
    readonly presentDays: number,
    readonly workingDays: number,
    readonly percentage: number,
    readonly stipendEligible: boolean,
  ) {}
}

export class MonthlySummaryDto {
  constructor(
    readonly sectionId: string,
    readonly month: string,
    readonly workingDays: number,
    readonly thresholdPercent: number,
    readonly rows: MonthlySummaryRowDto[],
  ) {}
}

export class StaffAttendanceEntryResponseDto {
  constructor(
    readonly userId: string,
    readonly name: string,
    readonly status: AttendanceStatus | null,
  ) {}
}
