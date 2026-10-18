import { AttendanceRecordRow } from '@database/schema';

export type AttendanceStatusValue = AttendanceRecordRow['status'];

export class SheetEntryDto {
  constructor(
    readonly enrolmentId: string,
    readonly studentId: string,
    readonly rollNo: number,
    readonly nameBn: string,
    readonly nameEn: string,
    /** Null when nothing has been marked yet for this date/period. */
    readonly status: AttendanceStatusValue | null,
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
export interface MarkedCountDto {
  marked: number;
}

export class MarkResultDto {
  constructor(
    readonly date: string,
    readonly period: number,
    readonly marked: number,
    readonly counts: Record<AttendanceStatusValue, number>,
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
    readonly days: Record<string, AttendanceStatusValue>,
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
    readonly status: AttendanceStatusValue | null,
  ) {}
}
