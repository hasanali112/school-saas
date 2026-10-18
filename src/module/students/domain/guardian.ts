import type { Student } from './student';

export enum GuardianRelation {
  Father = 'father',
  Mother = 'mother',
  Other = 'other',
}

/** Guardians are keyed by phone: the same person is one row however many children they have. */
export interface Guardian {
  id: string;
  institutionId: string;
  phone: string;
  name: string;
  createdAt: Date;
}

export interface StudentGuardian {
  id: string;
  institutionId: string;
  studentId: string;
  guardianId: string;
  relation: GuardianRelation;
  /** The guardian who receives SMS and app notifications by default. */
  isPrimary: boolean;
  createdAt: Date;
}

export interface NewStudentGuardian {
  institutionId: string;
  studentId: string;
  guardianId: string;
  relation: GuardianRelation;
  isPrimary: boolean;
}

export interface LinkInput {
  institutionId: string;
  studentId: string;
  phone: string;
  name: string;
  relation: GuardianRelation;
  isPrimary: boolean;
}

export interface LinkedGuardian {
  link: StudentGuardian;
  guardian: Guardian;
}

export interface GuardianChild {
  link: StudentGuardian;
  student: Student;
}
