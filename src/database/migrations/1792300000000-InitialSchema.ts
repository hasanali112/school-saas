import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * The whole schema the Drizzle prototype had, rebuilt for TypeORM.
 *
 * Tenancy: every tenant table carries `institution_id` and is protected by FORCE row-level
 * security keyed on the per-transaction `app.institution_id` setting (DatabaseService.tenant()).
 * Tenant-scoped references use composite foreign keys `(institution_id, x_id)` →
 * `(institution_id, id)`, because Postgres checks foreign keys as the table owner and
 * would otherwise let a row point at another tenant's data.
 */
export class InitialSchema1792300000000 implements MigrationInterface {
  name = 'InitialSchema1792300000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(TYPES);
    await queryRunner.query(TABLES);
    await queryRunner.query(SECURITY);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(DROP);
  }
}

const TYPES = `
CREATE TYPE user_status AS ENUM ('active', 'disabled');
CREATE TYPE subject_kind AS ENUM ('general', 'religion');
CREATE TYPE religion AS ENUM ('islam', 'hindu', 'buddhist', 'christian');
CREATE TYPE class_subject_role AS ENUM ('compulsory', 'fourth_optional', 'religion');
CREATE TYPE holiday_kind AS ENUM ('government', 'institution');
CREATE TYPE student_status AS ENUM ('active', 'promoted', 'transferred', 'exited');
CREATE TYPE gender AS ENUM ('male', 'female', 'other');
CREATE TYPE blood_group AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
CREATE TYPE guardian_relation AS ENUM ('father', 'mother', 'other');
CREATE TYPE consent_purpose AS ENUM ('sms', 'app', 'ai_processing', 'photo');
CREATE TYPE consent_source AS ENUM ('app', 'paper', 'phone', 'office');
CREATE TYPE leave_applies_to AS ENUM ('staff', 'student', 'both');
CREATE TYPE leave_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
CREATE TYPE applicant_kind AS ENUM ('staff', 'student');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'leave');
CREATE TYPE sms_purpose AS ENUM ('absence', 'due_reminder', 'result', 'admission', 'general');
CREATE TYPE sms_batch_status AS ENUM ('draft', 'sending', 'sent', 'failed', 'cancelled');
CREATE TYPE sms_message_status AS ENUM ('pending', 'sent', 'delivered', 'failed');
CREATE TYPE sms_ledger_kind AS ENUM ('top_up', 'send', 'refund', 'adjustment');
`;

const TABLES = `
CREATE TABLE institutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name_bn text NOT NULL,
  name_en text NOT NULL,
  eiin text UNIQUE,
  address_bn text,
  address_en text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions (id),
  phone text NOT NULL,
  name text NOT NULL,
  password_hash text,
  roles text[] NOT NULL,
  status user_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT users_tenant_key UNIQUE (institution_id, id),
  CONSTRAINT users_institution_phone_uq UNIQUE (institution_id, phone)
);
CREATE INDEX users_phone_idx ON users (phone);

CREATE TABLE otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  code_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  attempts integer NOT NULL DEFAULT 0,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX otp_codes_user_idx ON otp_codes (user_id);

CREATE TABLE academic_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions (id),
  name text NOT NULL,
  starts_on date NOT NULL,
  ends_on date NOT NULL,
  is_current boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT academic_sessions_tenant_key UNIQUE (institution_id, id),
  CONSTRAINT academic_sessions_name_uq UNIQUE (institution_id, name),
  CONSTRAINT academic_sessions_dates_ck CHECK (starts_on < ends_on)
);
CREATE UNIQUE INDEX academic_sessions_one_current_uq
  ON academic_sessions (institution_id) WHERE is_current;

CREATE TABLE shifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions (id),
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT shifts_tenant_key UNIQUE (institution_id, id),
  CONSTRAINT shifts_name_uq UNIQUE (institution_id, name)
);

CREATE TABLE classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions (id),
  name text NOT NULL,
  ordinal integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT classes_tenant_key UNIQUE (institution_id, id),
  CONSTRAINT classes_name_uq UNIQUE (institution_id, name)
);

CREATE TABLE sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions (id),
  class_id uuid NOT NULL,
  shift_id uuid,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sections_tenant_key UNIQUE (institution_id, id),
  CONSTRAINT sections_class_name_uq UNIQUE (institution_id, class_id, name),
  CONSTRAINT sections_class_fk FOREIGN KEY (institution_id, class_id)
    REFERENCES classes (institution_id, id) ON DELETE CASCADE,
  CONSTRAINT sections_shift_fk FOREIGN KEY (institution_id, shift_id)
    REFERENCES shifts (institution_id, id)
);

CREATE TABLE subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions (id),
  code text NOT NULL,
  name_bn text NOT NULL,
  name_en text NOT NULL,
  kind subject_kind NOT NULL DEFAULT 'general',
  religion religion,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT subjects_tenant_key UNIQUE (institution_id, id),
  CONSTRAINT subjects_code_uq UNIQUE (institution_id, code),
  CONSTRAINT subjects_religion_ck CHECK ((kind = 'religion') = (religion IS NOT NULL))
);

CREATE TABLE class_subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions (id),
  class_id uuid NOT NULL,
  subject_id uuid NOT NULL,
  role class_subject_role NOT NULL DEFAULT 'compulsory',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT class_subjects_uq UNIQUE (institution_id, class_id, subject_id),
  CONSTRAINT class_subjects_class_fk FOREIGN KEY (institution_id, class_id)
    REFERENCES classes (institution_id, id) ON DELETE CASCADE,
  CONSTRAINT class_subjects_subject_fk FOREIGN KEY (institution_id, subject_id)
    REFERENCES subjects (institution_id, id) ON DELETE CASCADE
);

CREATE TABLE teacher_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions (id),
  session_id uuid NOT NULL,
  section_id uuid NOT NULL,
  subject_id uuid NOT NULL,
  teacher_user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT teacher_assignments_uq UNIQUE (institution_id, session_id, section_id, subject_id),
  CONSTRAINT teacher_assignments_session_fk FOREIGN KEY (institution_id, session_id)
    REFERENCES academic_sessions (institution_id, id),
  CONSTRAINT teacher_assignments_section_fk FOREIGN KEY (institution_id, section_id)
    REFERENCES sections (institution_id, id) ON DELETE CASCADE,
  CONSTRAINT teacher_assignments_subject_fk FOREIGN KEY (institution_id, subject_id)
    REFERENCES subjects (institution_id, id) ON DELETE CASCADE,
  CONSTRAINT teacher_assignments_teacher_fk FOREIGN KEY (institution_id, teacher_user_id)
    REFERENCES users (institution_id, id) ON DELETE CASCADE
);
CREATE INDEX teacher_assignments_teacher_idx
  ON teacher_assignments (institution_id, teacher_user_id, session_id);

CREATE TABLE section_class_teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions (id),
  session_id uuid NOT NULL,
  section_id uuid NOT NULL,
  teacher_user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT section_class_teachers_uq UNIQUE (institution_id, session_id, section_id),
  CONSTRAINT section_class_teachers_session_fk FOREIGN KEY (institution_id, session_id)
    REFERENCES academic_sessions (institution_id, id),
  CONSTRAINT section_class_teachers_section_fk FOREIGN KEY (institution_id, section_id)
    REFERENCES sections (institution_id, id) ON DELETE CASCADE,
  CONSTRAINT section_class_teachers_teacher_fk FOREIGN KEY (institution_id, teacher_user_id)
    REFERENCES users (institution_id, id) ON DELETE CASCADE
);

CREATE TABLE holidays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions (id),
  date date NOT NULL,
  name_bn text NOT NULL,
  name_en text NOT NULL,
  kind holiday_kind NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT holidays_date_uq UNIQUE (institution_id, date)
);

CREATE TABLE students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions (id),
  admission_no text NOT NULL,
  name_bn text NOT NULL,
  name_en text NOT NULL,
  date_of_birth date,
  gender gender,
  blood_group blood_group,
  religion religion,
  birth_certificate_no text,
  address_bn text,
  address_en text,
  photo_key text,
  status student_status NOT NULL DEFAULT 'active',
  exited_at timestamptz,
  exit_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT students_tenant_key UNIQUE (institution_id, id),
  CONSTRAINT students_institution_admission_uq UNIQUE (institution_id, admission_no)
);
CREATE INDEX students_institution_name_idx ON students (institution_id, name_en);

CREATE TABLE enrolments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions (id),
  student_id uuid NOT NULL,
  session_id uuid NOT NULL,
  section_id uuid NOT NULL,
  roll_no integer NOT NULL,
  fourth_subject_id uuid,
  religion_subject_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT enrolments_tenant_key UNIQUE (institution_id, id),
  CONSTRAINT enrolments_student_session_uq UNIQUE (institution_id, session_id, student_id),
  CONSTRAINT enrolments_section_roll_uq UNIQUE (institution_id, session_id, section_id, roll_no),
  CONSTRAINT enrolments_student_fk FOREIGN KEY (institution_id, student_id)
    REFERENCES students (institution_id, id) ON DELETE CASCADE,
  CONSTRAINT enrolments_session_fk FOREIGN KEY (institution_id, session_id)
    REFERENCES academic_sessions (institution_id, id),
  CONSTRAINT enrolments_section_fk FOREIGN KEY (institution_id, section_id)
    REFERENCES sections (institution_id, id),
  CONSTRAINT enrolments_fourth_subject_fk FOREIGN KEY (institution_id, fourth_subject_id)
    REFERENCES subjects (institution_id, id),
  CONSTRAINT enrolments_religion_subject_fk FOREIGN KEY (institution_id, religion_subject_id)
    REFERENCES subjects (institution_id, id)
);
CREATE INDEX enrolments_section_idx ON enrolments (institution_id, section_id, session_id);

CREATE TABLE guardians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions (id),
  phone text NOT NULL,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT guardians_tenant_key UNIQUE (institution_id, id),
  CONSTRAINT guardians_institution_phone_uq UNIQUE (institution_id, phone)
);

CREATE TABLE student_guardians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions (id),
  student_id uuid NOT NULL,
  guardian_id uuid NOT NULL,
  relation guardian_relation NOT NULL,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT student_guardians_uq UNIQUE (institution_id, student_id, guardian_id),
  CONSTRAINT student_guardians_student_fk FOREIGN KEY (institution_id, student_id)
    REFERENCES students (institution_id, id) ON DELETE CASCADE,
  CONSTRAINT student_guardians_guardian_fk FOREIGN KEY (institution_id, guardian_id)
    REFERENCES guardians (institution_id, id) ON DELETE CASCADE
);
CREATE INDEX student_guardians_guardian_idx ON student_guardians (institution_id, guardian_id);

CREATE TABLE consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions (id),
  guardian_id uuid NOT NULL,
  purpose consent_purpose NOT NULL,
  granted boolean NOT NULL,
  notice_version text NOT NULL,
  source consent_source NOT NULL,
  recorded_by uuid,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT consents_guardian_purpose_uq UNIQUE (institution_id, guardian_id, purpose),
  CONSTRAINT consents_guardian_fk FOREIGN KEY (institution_id, guardian_id)
    REFERENCES guardians (institution_id, id) ON DELETE CASCADE
);

CREATE TABLE leave_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions (id),
  name text NOT NULL,
  applies_to leave_applies_to NOT NULL DEFAULT 'both',
  max_days_per_year integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT leave_types_tenant_key UNIQUE (institution_id, id),
  CONSTRAINT leave_types_institution_name_uq UNIQUE (institution_id, name)
);

CREATE TABLE leave_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions (id),
  leave_type_id uuid NOT NULL,
  applicant_kind applicant_kind NOT NULL,
  user_id uuid,
  student_id uuid,
  from_date date NOT NULL,
  to_date date NOT NULL,
  reason text NOT NULL,
  status leave_status NOT NULL DEFAULT 'pending',
  applied_by uuid NOT NULL,
  decided_by uuid,
  decided_at timestamptz,
  decision_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT leave_applications_type_fk FOREIGN KEY (institution_id, leave_type_id)
    REFERENCES leave_types (institution_id, id),
  CONSTRAINT leave_applications_user_fk FOREIGN KEY (institution_id, user_id)
    REFERENCES users (institution_id, id) ON DELETE CASCADE,
  CONSTRAINT leave_applications_student_fk FOREIGN KEY (institution_id, student_id)
    REFERENCES students (institution_id, id) ON DELETE CASCADE,
  CONSTRAINT leave_applications_applicant_ck CHECK (
    (applicant_kind = 'staff' AND user_id IS NOT NULL AND student_id IS NULL) OR
    (applicant_kind = 'student' AND student_id IS NOT NULL AND user_id IS NULL)
  ),
  CONSTRAINT leave_applications_dates_ck CHECK (from_date <= to_date)
);
CREATE INDEX leave_applications_status_idx ON leave_applications (institution_id, status);
CREATE INDEX leave_applications_student_dates_idx
  ON leave_applications (institution_id, student_id, from_date, to_date);

CREATE TABLE attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions (id),
  session_id uuid NOT NULL,
  section_id uuid NOT NULL,
  enrolment_id uuid NOT NULL,
  student_id uuid NOT NULL,
  date date NOT NULL,
  period integer NOT NULL DEFAULT 0,
  status attendance_status NOT NULL,
  marked_by uuid NOT NULL,
  marked_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  updated_at timestamptz,
  CONSTRAINT attendance_enrolment_date_period_uq UNIQUE (institution_id, enrolment_id, date, period),
  CONSTRAINT attendance_session_fk FOREIGN KEY (institution_id, session_id)
    REFERENCES academic_sessions (institution_id, id),
  CONSTRAINT attendance_section_fk FOREIGN KEY (institution_id, section_id)
    REFERENCES sections (institution_id, id),
  CONSTRAINT attendance_enrolment_fk FOREIGN KEY (institution_id, enrolment_id)
    REFERENCES enrolments (institution_id, id) ON DELETE CASCADE,
  CONSTRAINT attendance_student_fk FOREIGN KEY (institution_id, student_id)
    REFERENCES students (institution_id, id)
);
-- Section-day lookups (take attendance, register, summary) all hit this.
CREATE INDEX attendance_section_date_idx ON attendance_records (institution_id, section_id, date);

CREATE TABLE staff_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions (id),
  user_id uuid NOT NULL,
  date date NOT NULL,
  status attendance_status NOT NULL,
  marked_by uuid NOT NULL,
  marked_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT staff_attendance_user_date_uq UNIQUE (institution_id, user_id, date),
  CONSTRAINT staff_attendance_user_fk FOREIGN KEY (institution_id, user_id)
    REFERENCES users (institution_id, id) ON DELETE CASCADE
);
CREATE INDEX staff_attendance_date_idx ON staff_attendance (institution_id, date);

CREATE TABLE sms_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions (id),
  key text NOT NULL,
  name text NOT NULL,
  body text NOT NULL,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sms_templates_key_uq UNIQUE (institution_id, key)
);

CREATE TABLE sms_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions (id),
  purpose sms_purpose NOT NULL,
  status sms_batch_status NOT NULL DEFAULT 'draft',
  template_key text,
  body text NOT NULL,
  dedupe_key text,
  recipient_count integer NOT NULL,
  segment_count integer NOT NULL,
  cost_paisa integer NOT NULL,
  sent_count integer NOT NULL DEFAULT 0,
  failed_count integer NOT NULL DEFAULT 0,
  created_by uuid,
  sent_by uuid,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sms_batches_tenant_key UNIQUE (institution_id, id)
);
CREATE UNIQUE INDEX sms_batches_dedupe_uq
  ON sms_batches (institution_id, dedupe_key) WHERE dedupe_key IS NOT NULL;
CREATE INDEX sms_batches_status_idx ON sms_batches (institution_id, status, created_at);

CREATE TABLE sms_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions (id),
  batch_id uuid NOT NULL,
  guardian_id uuid,
  student_id uuid,
  phone text NOT NULL,
  body text NOT NULL,
  segments integer NOT NULL,
  cost_paisa integer NOT NULL,
  status sms_message_status NOT NULL DEFAULT 'pending',
  gateway text,
  provider_message_id text,
  error text,
  sent_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sms_messages_batch_fk FOREIGN KEY (institution_id, batch_id)
    REFERENCES sms_batches (institution_id, id) ON DELETE CASCADE,
  CONSTRAINT sms_messages_guardian_fk FOREIGN KEY (institution_id, guardian_id)
    REFERENCES guardians (institution_id, id) ON DELETE SET NULL (guardian_id),
  CONSTRAINT sms_messages_student_fk FOREIGN KEY (institution_id, student_id)
    REFERENCES students (institution_id, id) ON DELETE SET NULL (student_id)
);
CREATE INDEX sms_messages_batch_idx ON sms_messages (institution_id, batch_id);
CREATE INDEX sms_messages_provider_idx ON sms_messages (provider_message_id);

CREATE TABLE sms_balances (
  institution_id uuid PRIMARY KEY REFERENCES institutions (id),
  balance_paisa integer NOT NULL DEFAULT 0,
  rate_paisa_per_segment integer,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sms_balances_non_negative_ck CHECK (balance_paisa >= 0)
);

CREATE TABLE sms_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions (id),
  kind sms_ledger_kind NOT NULL,
  amount_paisa integer NOT NULL,
  balance_after_paisa integer NOT NULL,
  batch_id uuid,
  note text,
  actor_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX sms_ledger_created_idx ON sms_ledger (institution_id, created_at);

CREATE TABLE audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions (id),
  actor_id uuid NOT NULL,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id text,
  before jsonb,
  after jsonb,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_log_entity_idx ON audit_log (institution_id, entity, entity_id);
`;

/** Every table keyed by institution_id gets the same policy. */
const TENANT_TABLES = [
  'users',
  'academic_sessions',
  'shifts',
  'classes',
  'sections',
  'subjects',
  'class_subjects',
  'teacher_assignments',
  'section_class_teachers',
  'holidays',
  'students',
  'enrolments',
  'guardians',
  'student_guardians',
  'consents',
  'leave_types',
  'leave_applications',
  'attendance_records',
  'staff_attendance',
  'sms_templates',
  'sms_batches',
  'sms_messages',
  'sms_balances',
  'sms_ledger',
  'audit_log',
];

const tenantPolicy = (table: string): string => `
ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;
ALTER TABLE ${table} FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON ${table}
  USING (institution_id = app_current_institution())
  WITH CHECK (institution_id = app_current_institution());
`;

const SECURITY = `
-- NULL (no row matches) when no tenant transaction is open, instead of a cast error.
CREATE FUNCTION app_current_institution() RETURNS uuid
  LANGUAGE sql STABLE
  AS $$ SELECT NULLIF(current_setting('app.institution_id', true), '')::uuid $$;

${TENANT_TABLES.map(tenantPolicy).join('')}

-- A tenant sees only its own institution row.
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutions FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON institutions
  USING (id = app_current_institution())
  WITH CHECK (id = app_current_institution());

-- Pre-auth only: RLS on with no policy, so only the BYPASSRLS system role reaches it.
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_codes FORCE ROW LEVEL SECURITY;

-- Audit log and SMS ledger are append-only.
CREATE FUNCTION reject_mutation() RETURNS trigger
  LANGUAGE plpgsql
  AS $$ BEGIN RAISE EXCEPTION '% is append-only', TG_TABLE_NAME; END $$;
CREATE TRIGGER audit_log_append_only BEFORE UPDATE OR DELETE ON audit_log
  FOR EACH ROW EXECUTE FUNCTION reject_mutation();
CREATE TRIGGER sms_ledger_append_only BEFORE UPDATE OR DELETE ON sms_ledger
  FOR EACH ROW EXECUTE FUNCTION reject_mutation();
`;

const DROP = `
DROP TABLE IF EXISTS
  audit_log, sms_ledger, sms_balances, sms_messages, sms_batches, sms_templates,
  staff_attendance, attendance_records, leave_applications, leave_types, consents,
  student_guardians, guardians, enrolments, students, holidays, section_class_teachers,
  teacher_assignments, class_subjects, subjects, sections, classes, shifts,
  academic_sessions, otp_codes, users, institutions;
DROP FUNCTION IF EXISTS reject_mutation();
DROP FUNCTION IF EXISTS app_current_institution();
DROP TYPE IF EXISTS
  sms_ledger_kind, sms_message_status, sms_batch_status, sms_purpose, attendance_status,
  applicant_kind, leave_status, leave_applies_to, consent_source, consent_purpose,
  guardian_relation, blood_group, gender, student_status, holiday_kind,
  class_subject_role, religion, subject_kind, user_status;
`;
