import { Injectable } from '@nestjs/common';
import { and, asc, eq, gte, inArray, lte, sql } from 'drizzle-orm';
import { DatabaseService } from '@database/database.service';
import {
  AttendanceRecordRow,
  attendanceRecords,
  enrolments,
  leaveApplications,
  NewAttendanceRecordRow,
  NewStaffAttendanceRow,
  sectionClassTeachers,
  staffAttendance,
  students,
  teacherAssignments,
  users,
} from '@database/schema';

export interface RosterStatusRow {
  enrolmentId: string;
  studentId: string;
  rollNo: number;
  nameBn: string;
  nameEn: string;
  status: AttendanceRecordRow['status'] | null;
}

export interface StaffStatusRow {
  userId: string;
  name: string;
  status: AttendanceRecordRow['status'] | null;
}

@Injectable()
export class AttendanceRepository {
  constructor(private readonly database: DatabaseService) {}

  /** Sections the user teaches this session, as class teacher or subject teacher. One round trip. */
  findAssignedSectionIds(
    userId: string,
    sessionId: string,
  ): Promise<Set<string>> {
    return this.database.tenant(async (tx) => {
      const [asClassTeacher, asSubjectTeacher] = await Promise.all([
        tx
          .select({ sectionId: sectionClassTeachers.sectionId })
          .from(sectionClassTeachers)
          .where(
            and(
              eq(sectionClassTeachers.teacherUserId, userId),
              eq(sectionClassTeachers.sessionId, sessionId),
            ),
          ),
        tx
          .select({ sectionId: teacherAssignments.sectionId })
          .from(teacherAssignments)
          .where(
            and(
              eq(teacherAssignments.teacherUserId, userId),
              eq(teacherAssignments.sessionId, sessionId),
            ),
          ),
      ]);
      return new Set(
        [...asClassTeacher, ...asSubjectTeacher].map((r) => r.sectionId),
      );
    });
  }

  /** Roster left-joined with the records for one date/period: the take-attendance sheet in one query. */
  findSheet(
    sectionId: string,
    sessionId: string,
    date: string,
    period: number,
  ): Promise<RosterStatusRow[]> {
    return this.database.tenant((tx) =>
      tx
        .select({
          enrolmentId: enrolments.id,
          studentId: enrolments.studentId,
          rollNo: enrolments.rollNo,
          nameBn: students.nameBn,
          nameEn: students.nameEn,
          status: attendanceRecords.status,
        })
        .from(enrolments)
        .innerJoin(students, eq(students.id, enrolments.studentId))
        .leftJoin(
          attendanceRecords,
          and(
            eq(attendanceRecords.enrolmentId, enrolments.id),
            eq(attendanceRecords.date, date),
            eq(attendanceRecords.period, period),
          ),
        )
        .where(
          and(
            eq(enrolments.sectionId, sectionId),
            eq(enrolments.sessionId, sessionId),
          ),
        )
        .orderBy(asc(enrolments.rollNo)),
    );
  }

  /** Students of the section with an approved leave covering the date. */
  findStudentsOnApprovedLeave(
    sectionId: string,
    sessionId: string,
    date: string,
  ): Promise<Set<string>> {
    return this.database.tenant(async (tx) => {
      const rows = await tx
        .select({ studentId: leaveApplications.studentId })
        .from(leaveApplications)
        .innerJoin(
          enrolments,
          and(
            eq(enrolments.studentId, leaveApplications.studentId),
            eq(enrolments.sessionId, sessionId),
          ),
        )
        .where(
          and(
            eq(enrolments.sectionId, sectionId),
            eq(leaveApplications.status, 'approved'),
            lte(leaveApplications.fromDate, date),
            gte(leaveApplications.toDate, date),
          ),
        );
      return new Set(
        rows.map((r) => r.studentId).filter((id): id is string => !!id),
      );
    });
  }

  findExisting(
    enrolmentIds: readonly string[],
    date: string,
    period: number,
  ): Promise<AttendanceRecordRow[]> {
    if (enrolmentIds.length === 0) return Promise.resolve([]);
    return this.database.tenant((tx) =>
      tx
        .select()
        .from(attendanceRecords)
        .where(
          and(
            inArray(attendanceRecords.enrolmentId, [...enrolmentIds]),
            eq(attendanceRecords.date, date),
            eq(attendanceRecords.period, period),
          ),
        ),
    );
  }

  /** One statement for the whole sheet: insert new, update changed. */
  upsertMany(
    rows: readonly NewAttendanceRecordRow[],
    actorId: string,
  ): Promise<AttendanceRecordRow[]> {
    if (rows.length === 0) return Promise.resolve([]);
    return this.database.tenant((tx) =>
      tx
        .insert(attendanceRecords)
        .values([...rows])
        .onConflictDoUpdate({
          target: [
            attendanceRecords.institutionId,
            attendanceRecords.enrolmentId,
            attendanceRecords.date,
            attendanceRecords.period,
          ],
          set: {
            status: sql`excluded.status`,
            updatedBy: actorId,
            updatedAt: new Date(),
          },
        })
        .returning(),
    );
  }

  findMonth(
    sectionId: string,
    sessionId: string,
    from: string,
    to: string,
  ): Promise<AttendanceRecordRow[]> {
    return this.database.tenant((tx) =>
      tx
        .select()
        .from(attendanceRecords)
        .where(
          and(
            eq(attendanceRecords.sectionId, sectionId),
            eq(attendanceRecords.sessionId, sessionId),
            gte(attendanceRecords.date, from),
            lte(attendanceRecords.date, to),
          ),
        ),
    );
  }

  upsertStaffMany(rows: readonly NewStaffAttendanceRow[]): Promise<number> {
    if (rows.length === 0) return Promise.resolve(0);
    return this.database.tenant(async (tx) => {
      const written = await tx
        .insert(staffAttendance)
        .values([...rows])
        .onConflictDoUpdate({
          target: [
            staffAttendance.institutionId,
            staffAttendance.userId,
            staffAttendance.date,
          ],
          set: {
            status: sql`excluded.status`,
            markedBy: sql`excluded.marked_by`,
            markedAt: new Date(),
          },
        })
        .returning({ id: staffAttendance.id });
      return written.length;
    });
  }

  /** Every active user with their status for the date (null = not marked). */
  findStaffSheet(date: string): Promise<StaffStatusRow[]> {
    return this.database.tenant((tx) =>
      tx
        .select({
          userId: users.id,
          name: users.name,
          status: staffAttendance.status,
        })
        .from(users)
        .leftJoin(
          staffAttendance,
          and(
            eq(staffAttendance.userId, users.id),
            eq(staffAttendance.date, date),
          ),
        )
        .where(eq(users.status, 'active'))
        .orderBy(asc(users.name)),
    );
  }
}
