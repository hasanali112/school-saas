import type {
  AttendanceRecord,
  NewAttendanceRecord,
  NewStaffAttendance,
  StaffMark,
} from '../domain/attendance';

/** Only the attendance tables; rosters, leave and teacher assignments come through facades. */
export abstract class AttendanceRepositoryPort {
  abstract findRecords(
    enrolmentIds: readonly string[],
    date: string,
    period: number,
  ): Promise<AttendanceRecord[]>;
  /** One statement for the whole sheet: insert new, update changed. */
  abstract upsertMany(
    rows: readonly NewAttendanceRecord[],
    actorId: string,
  ): Promise<AttendanceRecord[]>;
  abstract findMonth(
    sectionId: string,
    sessionId: string,
    from: string,
    to: string,
  ): Promise<AttendanceRecord[]>;
  abstract upsertStaffMany(
    rows: readonly NewStaffAttendance[],
  ): Promise<number>;
  abstract findStaffMarks(date: string): Promise<StaffMark[]>;
}
