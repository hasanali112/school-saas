export enum AttendanceStatus {
  Present = 'present',
  Absent = 'absent',
  Late = 'late',
  Leave = 'leave',
}

/** Period 0 means once-daily attendance; 1..n are periods for institutions that mark per period. */
export const DAILY_PERIOD = 0;

/** Government stipend requires this attendance percentage (F1-05). */
export const STIPEND_THRESHOLD_PERCENT = 75;

/** Statuses that count as "attended" for the register and the stipend summary. */
export const PRESENT_STATUSES: ReadonlySet<AttendanceStatus> = new Set([
  AttendanceStatus.Present,
  AttendanceStatus.Late,
]);

export interface AttendanceRecord {
  id: string;
  institutionId: string;
  sessionId: string;
  sectionId: string;
  enrolmentId: string;
  studentId: string;
  date: string;
  period: number;
  status: AttendanceStatus;
  markedBy: string;
  markedAt: Date;
  updatedBy: string | null;
  updatedAt: Date | null;
}

export interface NewAttendanceRecord {
  institutionId: string;
  sessionId: string;
  sectionId: string;
  enrolmentId: string;
  studentId: string;
  date: string;
  period: number;
  status: AttendanceStatus;
  markedBy: string;
}

export interface NewStaffAttendance {
  institutionId: string;
  userId: string;
  date: string;
  status: AttendanceStatus;
  markedBy: string;
}

/** A staff member's mark for a day. */
export interface StaffMark {
  userId: string;
  status: AttendanceStatus;
}

/** Number of records per status. */
export interface StatusCounts {
  present: number;
  absent: number;
  late: number;
  leave: number;
}

/** ISO date → status, only for dates with a record. */
export interface DayStatuses {
  [date: string]: AttendanceStatus;
}
