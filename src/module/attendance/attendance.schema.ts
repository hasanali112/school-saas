import {
  date,
  foreignKey,
  index,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { academicSessions, sections } from '../academics/academics.schema';
import { institutions } from '../institutions/institutions.schema';
import { enrolments, students } from '../students/students.schema';
import { users } from '../users/users.schema';

export const attendanceStatus = pgEnum('attendance_status', [
  'present',
  'absent',
  'late',
  'leave',
]);

/** Period 0 means once-daily attendance; 1..n are periods for institutions that mark per period. */
export const DAILY_PERIOD = 0;

const institutionRef = () =>
  uuid('institution_id')
    .notNull()
    .references(() => institutions.id);

export const attendanceRecords = pgTable(
  'attendance_records',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    institutionId: institutionRef(),
    sessionId: uuid('session_id').notNull(),
    sectionId: uuid('section_id').notNull(),
    enrolmentId: uuid('enrolment_id').notNull(),
    studentId: uuid('student_id').notNull(),
    date: date('date').notNull(),
    period: integer('period').notNull().default(DAILY_PERIOD),
    status: attendanceStatus('status').notNull(),
    markedBy: uuid('marked_by').notNull(),
    markedAt: timestamp('marked_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedBy: uuid('updated_by'),
    updatedAt: timestamp('updated_at', { withTimezone: true }),
  },
  (t) => [
    foreignKey({
      name: 'attendance_session_fk',
      columns: [t.institutionId, t.sessionId],
      foreignColumns: [academicSessions.institutionId, academicSessions.id],
    }),
    foreignKey({
      name: 'attendance_section_fk',
      columns: [t.institutionId, t.sectionId],
      foreignColumns: [sections.institutionId, sections.id],
    }),
    foreignKey({
      name: 'attendance_enrolment_fk',
      columns: [t.institutionId, t.enrolmentId],
      foreignColumns: [enrolments.institutionId, enrolments.id],
    }).onDelete('cascade'),
    foreignKey({
      name: 'attendance_student_fk',
      columns: [t.institutionId, t.studentId],
      foreignColumns: [students.institutionId, students.id],
    }),
    uniqueIndex('attendance_enrolment_date_period_uq').on(
      t.institutionId,
      t.enrolmentId,
      t.date,
      t.period,
    ),
    // Section-day lookups (take attendance, register, summary) all hit this.
    index('attendance_section_date_idx').on(
      t.institutionId,
      t.sectionId,
      t.date,
    ),
  ],
);

export const staffAttendance = pgTable(
  'staff_attendance',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    institutionId: institutionRef(),
    userId: uuid('user_id').notNull(),
    date: date('date').notNull(),
    status: attendanceStatus('status').notNull(),
    markedBy: uuid('marked_by').notNull(),
    markedAt: timestamp('marked_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    foreignKey({
      name: 'staff_attendance_user_fk',
      columns: [t.institutionId, t.userId],
      foreignColumns: [users.institutionId, users.id],
    }).onDelete('cascade'),
    uniqueIndex('staff_attendance_user_date_uq').on(
      t.institutionId,
      t.userId,
      t.date,
    ),
    index('staff_attendance_date_idx').on(t.institutionId, t.date),
  ],
);

export type AttendanceRecordRow = typeof attendanceRecords.$inferSelect;
export type NewAttendanceRecordRow = typeof attendanceRecords.$inferInsert;
export type StaffAttendanceRow = typeof staffAttendance.$inferSelect;
export type NewStaffAttendanceRow = typeof staffAttendance.$inferInsert;
