import { LeaveApplicationRow, LeaveTypeRow } from '@database/schema';

export class LeaveTypeResponseDto {
  readonly id: string;
  readonly name: string;
  readonly appliesTo: LeaveTypeRow['appliesTo'];
  readonly maxDaysPerYear: number | null;

  private constructor(row: LeaveTypeRow) {
    this.id = row.id;
    this.name = row.name;
    this.appliesTo = row.appliesTo;
    this.maxDaysPerYear = row.maxDaysPerYear;
  }

  static from(row: LeaveTypeRow): LeaveTypeResponseDto {
    return new LeaveTypeResponseDto(row);
  }

  static fromMany(rows: readonly LeaveTypeRow[]): LeaveTypeResponseDto[] {
    return rows.map((row) => LeaveTypeResponseDto.from(row));
  }
}

export class LeaveApplicationResponseDto {
  readonly id: string;
  readonly leaveTypeId: string;
  readonly applicantKind: LeaveApplicationRow['applicantKind'];
  readonly userId: string | null;
  readonly studentId: string | null;
  readonly fromDate: string;
  readonly toDate: string;
  readonly days: number;
  readonly reason: string;
  readonly status: LeaveApplicationRow['status'];
  readonly decidedBy: string | null;
  readonly decidedAt: Date | null;
  readonly decisionNote: string | null;
  readonly createdAt: Date;

  private constructor(row: LeaveApplicationRow) {
    this.id = row.id;
    this.leaveTypeId = row.leaveTypeId;
    this.applicantKind = row.applicantKind;
    this.userId = row.userId;
    this.studentId = row.studentId;
    this.fromDate = row.fromDate;
    this.toDate = row.toDate;
    this.days = inclusiveDays(row.fromDate, row.toDate);
    this.reason = row.reason;
    this.status = row.status;
    this.decidedBy = row.decidedBy;
    this.decidedAt = row.decidedAt;
    this.decisionNote = row.decisionNote;
    this.createdAt = row.createdAt;
  }

  static from(row: LeaveApplicationRow): LeaveApplicationResponseDto {
    return new LeaveApplicationResponseDto(row);
  }

  static fromMany(
    rows: readonly LeaveApplicationRow[],
  ): LeaveApplicationResponseDto[] {
    return rows.map((row) => LeaveApplicationResponseDto.from(row));
  }
}

const MS_PER_DAY = 86_400_000;

/** Calendar days from `from` to `to`, both inclusive; ISO dates only. */
export function inclusiveDays(from: string, to: string): number {
  return Math.round((Date.parse(to) - Date.parse(from)) / MS_PER_DAY) + 1;
}
