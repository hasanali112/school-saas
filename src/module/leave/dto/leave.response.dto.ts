import {
  ApplicantKind,
  inclusiveDays,
  LeaveAppliesTo,
  LeaveStatus,
} from '../domain/leave';
import type { LeaveApplication, LeaveType } from '../domain/leave';

export class LeaveTypeResponseDto {
  readonly id: string;
  readonly name: string;
  readonly appliesTo: LeaveAppliesTo;
  readonly maxDaysPerYear: number | null;

  private constructor(type: LeaveType) {
    this.id = type.id;
    this.name = type.name;
    this.appliesTo = type.appliesTo;
    this.maxDaysPerYear = type.maxDaysPerYear;
  }

  static from(type: LeaveType): LeaveTypeResponseDto {
    return new LeaveTypeResponseDto(type);
  }

  static fromMany(types: readonly LeaveType[]): LeaveTypeResponseDto[] {
    return types.map((type) => LeaveTypeResponseDto.from(type));
  }
}

export class LeaveApplicationResponseDto {
  readonly id: string;
  readonly leaveTypeId: string;
  readonly applicantKind: ApplicantKind;
  readonly userId: string | null;
  readonly studentId: string | null;
  readonly fromDate: string;
  readonly toDate: string;
  readonly days: number;
  readonly reason: string;
  readonly status: LeaveStatus;
  readonly decidedBy: string | null;
  readonly decidedAt: Date | null;
  readonly decisionNote: string | null;
  readonly createdAt: Date;

  private constructor(application: LeaveApplication) {
    this.id = application.id;
    this.leaveTypeId = application.leaveTypeId;
    this.applicantKind = application.applicantKind;
    this.userId = application.userId;
    this.studentId = application.studentId;
    this.fromDate = application.fromDate;
    this.toDate = application.toDate;
    this.days = inclusiveDays(application.fromDate, application.toDate);
    this.reason = application.reason;
    this.status = application.status;
    this.decidedBy = application.decidedBy;
    this.decidedAt = application.decidedAt;
    this.decisionNote = application.decisionNote;
    this.createdAt = application.createdAt;
  }

  static from(application: LeaveApplication): LeaveApplicationResponseDto {
    return new LeaveApplicationResponseDto(application);
  }

  static fromMany(
    applications: readonly LeaveApplication[],
  ): LeaveApplicationResponseDto[] {
    return applications.map((a) => LeaveApplicationResponseDto.from(a));
  }
}
