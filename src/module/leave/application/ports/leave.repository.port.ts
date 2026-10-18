import type {
  LeaveApplicant,
  LeaveApplication,
  LeaveDecision,
  LeaveFilter,
  LeaveType,
  NewLeaveApplication,
  NewLeaveType,
} from '../../domain/leave';

export abstract class LeaveRepository {
  abstract insertType(data: NewLeaveType): Promise<LeaveType>;
  abstract findTypes(): Promise<LeaveType[]>;
  abstract findTypeById(id: string): Promise<LeaveType | undefined>;
  abstract insertApplication(
    data: NewLeaveApplication,
  ): Promise<LeaveApplication>;
  abstract findApplications(filter: LeaveFilter): Promise<LeaveApplication[]>;
  abstract findById(id: string): Promise<LeaveApplication | undefined>;
  /** Approved applications of the same applicant and type inside a calendar year, for the cap check. */
  abstract findApprovedInYear(
    applicant: LeaveApplicant,
    leaveTypeId: string,
    year: number,
  ): Promise<LeaveApplication[]>;
  /** Transitions only from pending; undefined if the row was not pending (or not ours). */
  abstract decide(
    id: string,
    status: LeaveDecision,
    decidedBy: string,
    note?: string,
  ): Promise<LeaveApplication | undefined>;
  /** Of the given students, those with an approved leave covering the date. */
  abstract findStudentsOnApprovedLeave(
    studentIds: readonly string[],
    date: string,
  ): Promise<Set<string>>;
}
