export enum LeaveAppliesTo {
  Staff = 'staff',
  Student = 'student',
  Both = 'both',
}

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

export interface LeaveType {
  id: string;
  institutionId: string;
  name: string;
  appliesTo: LeaveAppliesTo;
  /** Null = unlimited. Enforced on approval, not application. */
  maxDaysPerYear: number | null;
  createdAt: Date;
}

export interface NewLeaveType {
  institutionId: string;
  name: string;
  appliesTo: LeaveAppliesTo;
  maxDaysPerYear: number | null;
}

export interface LeaveApplication {
  id: string;
  institutionId: string;
  leaveTypeId: string;
  applicantKind: ApplicantKind;
  /** Exactly one of userId / studentId is set, matching applicantKind (checked in the service). */
  userId: string | null;
  studentId: string | null;
  fromDate: string;
  toDate: string;
  reason: string;
  status: LeaveStatus;
  appliedBy: string;
  decidedBy: string | null;
  decidedAt: Date | null;
  decisionNote: string | null;
  createdAt: Date;
}

export interface NewLeaveApplication {
  institutionId: string;
  leaveTypeId: string;
  applicantKind: ApplicantKind;
  userId: string | null;
  studentId: string | null;
  fromDate: string;
  toDate: string;
  reason: string;
  appliedBy: string;
}

export interface LeaveFilter {
  status?: LeaveStatus;
  kind?: ApplicantKind;
}

/** Whose leave it is: a staff user or a student. */
export interface LeaveApplicant {
  userId: string | null;
  studentId: string | null;
}

/** The statuses a pending application can move to. */
export type LeaveDecision =
  LeaveStatus.Approved | LeaveStatus.Rejected | LeaveStatus.Cancelled;

const MS_PER_DAY = 86_400_000;

/** Calendar days from `from` to `to`, both inclusive; ISO dates only. */
export function inclusiveDays(from: string, to: string): number {
  return Math.round((Date.parse(to) - Date.parse(from)) / MS_PER_DAY) + 1;
}
