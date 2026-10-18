import {
  boolean,
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
import {
  academicSessions,
  religion,
  sections,
  subjects,
} from '../academics/academics.schema';
import { institutions } from '../institutions/institutions.schema';

export const studentStatus = pgEnum('student_status', [
  'active',
  'promoted',
  'transferred',
  'exited',
]);
export const gender = pgEnum('gender', ['male', 'female', 'other']);
export const bloodGroup = pgEnum('blood_group', [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
]);

/** The digital admission register (F1-03). Per-session roll and section live on enrolments. */
export const students = pgTable(
  'students',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    institutionId: uuid('institution_id')
      .notNull()
      .references(() => institutions.id),
    admissionNo: text('admission_no').notNull(),
    nameBn: text('name_bn').notNull(),
    nameEn: text('name_en').notNull(),
    dateOfBirth: date('date_of_birth'),
    gender: gender('gender'),
    bloodGroup: bloodGroup('blood_group'),
    religion: religion('religion'),
    birthCertificateNo: text('birth_certificate_no'),
    addressBn: text('address_bn'),
    addressEn: text('address_en'),
    /** Object-store key; the file itself never goes through the API row. */
    photoKey: text('photo_key'),
    status: studentStatus('status').notNull().default('active'),
    exitedAt: timestamp('exited_at', { withTimezone: true }),
    exitReason: text('exit_reason'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique('students_tenant_key').on(t.institutionId, t.id),
    uniqueIndex('students_institution_admission_uq').on(
      t.institutionId,
      t.admissionNo,
    ),
    index('students_institution_name_idx').on(t.institutionId, t.nameEn),
  ],
);

/** One row per student per session: roll, section and the student's optional-subject choices. */
export const enrolments = pgTable(
  'enrolments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    institutionId: uuid('institution_id')
      .notNull()
      .references(() => institutions.id),
    studentId: uuid('student_id').notNull(),
    sessionId: uuid('session_id').notNull(),
    sectionId: uuid('section_id').notNull(),
    rollNo: integer('roll_no').notNull(),
    fourthSubjectId: uuid('fourth_subject_id'),
    religionSubjectId: uuid('religion_subject_id'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique('enrolments_tenant_key').on(t.institutionId, t.id),
    foreignKey({
      name: 'enrolments_student_fk',
      columns: [t.institutionId, t.studentId],
      foreignColumns: [students.institutionId, students.id],
    }).onDelete('cascade'),
    foreignKey({
      name: 'enrolments_session_fk',
      columns: [t.institutionId, t.sessionId],
      foreignColumns: [academicSessions.institutionId, academicSessions.id],
    }),
    foreignKey({
      name: 'enrolments_section_fk',
      columns: [t.institutionId, t.sectionId],
      foreignColumns: [sections.institutionId, sections.id],
    }),
    foreignKey({
      name: 'enrolments_fourth_subject_fk',
      columns: [t.institutionId, t.fourthSubjectId],
      foreignColumns: [subjects.institutionId, subjects.id],
    }),
    foreignKey({
      name: 'enrolments_religion_subject_fk',
      columns: [t.institutionId, t.religionSubjectId],
      foreignColumns: [subjects.institutionId, subjects.id],
    }),
    uniqueIndex('enrolments_student_session_uq').on(
      t.institutionId,
      t.sessionId,
      t.studentId,
    ),
    uniqueIndex('enrolments_section_roll_uq').on(
      t.institutionId,
      t.sessionId,
      t.sectionId,
      t.rollNo,
    ),
  ],
);

export const guardianRelation = pgEnum('guardian_relation', [
  'father',
  'mother',
  'other',
]);

/** Guardians are keyed by phone: the same person is one row however many children they have. */
export const guardians = pgTable(
  'guardians',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    institutionId: uuid('institution_id')
      .notNull()
      .references(() => institutions.id),
    phone: text('phone').notNull(),
    name: text('name').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique('guardians_tenant_key').on(t.institutionId, t.id),
    uniqueIndex('guardians_institution_phone_uq').on(t.institutionId, t.phone),
  ],
);

export const studentGuardians = pgTable(
  'student_guardians',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    institutionId: uuid('institution_id')
      .notNull()
      .references(() => institutions.id),
    studentId: uuid('student_id').notNull(),
    guardianId: uuid('guardian_id').notNull(),
    relation: guardianRelation('relation').notNull(),
    /** The guardian who receives SMS and app notifications by default. */
    isPrimary: boolean('is_primary').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    foreignKey({
      name: 'student_guardians_student_fk',
      columns: [t.institutionId, t.studentId],
      foreignColumns: [students.institutionId, students.id],
    }).onDelete('cascade'),
    foreignKey({
      name: 'student_guardians_guardian_fk',
      columns: [t.institutionId, t.guardianId],
      foreignColumns: [guardians.institutionId, guardians.id],
    }).onDelete('cascade'),
    uniqueIndex('student_guardians_uq').on(
      t.institutionId,
      t.studentId,
      t.guardianId,
    ),
    index('student_guardians_guardian_idx').on(t.institutionId, t.guardianId),
  ],
);

export type StudentRow = typeof students.$inferSelect;
export type NewStudentRow = typeof students.$inferInsert;
export type EnrolmentRow = typeof enrolments.$inferSelect;
export type NewEnrolmentRow = typeof enrolments.$inferInsert;
export type GuardianRow = typeof guardians.$inferSelect;
export type NewGuardianRow = typeof guardians.$inferInsert;
export type StudentGuardianRow = typeof studentGuardians.$inferSelect;
export type NewStudentGuardianRow = typeof studentGuardians.$inferInsert;
