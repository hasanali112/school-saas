import type { Student, StudentStatus } from './student';

/** One row per student per session: roll, section and optional-subject choices. */
export interface Enrolment {
  id: string;
  institutionId: string;
  studentId: string;
  sessionId: string;
  sectionId: string;
  rollNo: number;
  fourthSubjectId: string | null;
  religionSubjectId: string | null;
  createdAt: Date;
}

export interface NewEnrolment {
  institutionId: string;
  studentId: string;
  sessionId: string;
  sectionId: string;
  rollNo: number;
  fourthSubjectId: string | null;
  religionSubjectId: string | null;
}

export interface RosterRow {
  enrolment: Enrolment;
  student: Student;
}

/** One line of a section roster; what attendance and marks entry render per row. */
export interface RosterEntry {
  enrolmentId: string;
  studentId: string;
  rollNo: number;
  admissionNo: string;
  nameBn: string;
  nameEn: string;
  status: StudentStatus;
}
