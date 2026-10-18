import {
  date,
  foreignKey,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { institutions } from '../institutions/institutions.schema';
import { students } from '../students/students.schema';
import { users } from '../users/users.schema';

const institutionRef = () =>
  uuid('institution_id')
    .notNull()
    .references(() => institutions.id);

export const leaveAppliesTo = pgEnum('leave_applies_to', [
  'staff',
  'student',
  'both',
]);
export const leaveStatus = pgEnum('leave_status', [
  'pending',
  'approved',
  'rejected',
  'cancelled',
]);
export const applicantKind = pgEnum('applicant_kind', ['staff', 'student']);

export const leaveTypes = pgTable(
  'leave_types',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    institutionId: institutionRef(),
    name: text('name').notNull(),
    appliesTo: leaveAppliesTo('applies_to').notNull().default('both'),
    /** Null = unlimited. Enforced on approval, not application. */
    maxDaysPerYear: integer('max_days_per_year'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique('leave_types_tenant_key').on(t.institutionId, t.id),
    uniqueIndex('leave_types_institution_name_uq').on(t.institutionId, t.name),
  ],
);

export const leaveApplications = pgTable(
  'leave_applications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    institutionId: institutionRef(),
    leaveTypeId: uuid('leave_type_id').notNull(),
    applicantKind: applicantKind('applicant_kind').notNull(),
    /** Exactly one of userId / studentId is set, matching applicantKind (checked in the service). */
    userId: uuid('user_id'),
    studentId: uuid('student_id'),
    fromDate: date('from_date').notNull(),
    toDate: date('to_date').notNull(),
    reason: text('reason').notNull(),
    status: leaveStatus('status').notNull().default('pending'),
    appliedBy: uuid('applied_by').notNull(),
    decidedBy: uuid('decided_by'),
    decidedAt: timestamp('decided_at', { withTimezone: true }),
    decisionNote: text('decision_note'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    foreignKey({
      name: 'leave_applications_type_fk',
      columns: [t.institutionId, t.leaveTypeId],
      foreignColumns: [leaveTypes.institutionId, leaveTypes.id],
    }),
    foreignKey({
      name: 'leave_applications_user_fk',
      columns: [t.institutionId, t.userId],
      foreignColumns: [users.institutionId, users.id],
    }).onDelete('cascade'),
    foreignKey({
      name: 'leave_applications_student_fk',
      columns: [t.institutionId, t.studentId],
      foreignColumns: [students.institutionId, students.id],
    }).onDelete('cascade'),
    index('leave_applications_status_idx').on(t.institutionId, t.status),
    index('leave_applications_student_dates_idx').on(
      t.institutionId,
      t.studentId,
      t.fromDate,
      t.toDate,
    ),
  ],
);

export type LeaveTypeRow = typeof leaveTypes.$inferSelect;
export type NewLeaveTypeRow = typeof leaveTypes.$inferInsert;
export type LeaveApplicationRow = typeof leaveApplications.$inferSelect;
export type NewLeaveApplicationRow = typeof leaveApplications.$inferInsert;
