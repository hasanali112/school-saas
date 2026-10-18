export enum SubjectKind {
  General = 'general',
  Religion = 'religion',
}

export enum Religion {
  Islam = 'islam',
  Hindu = 'hindu',
  Buddhist = 'buddhist',
  Christian = 'christian',
}

/** How a subject is offered in a class. */
export enum ClassSubjectRole {
  Compulsory = 'compulsory',
  FourthOptional = 'fourth_optional',
  Religion = 'religion',
}

export interface Subject {
  id: string;
  institutionId: string;
  code: string;
  nameBn: string;
  nameEn: string;
  kind: SubjectKind;
  /** Set only for religion subjects. */
  religion: Religion | null;
  createdAt: Date;
}

export interface NewSubject {
  institutionId: string;
  code: string;
  nameBn: string;
  nameEn: string;
  kind: SubjectKind;
  religion: Religion | null;
}

export interface ClassSubject {
  id: string;
  institutionId: string;
  classId: string;
  subjectId: string;
  role: ClassSubjectRole;
  createdAt: Date;
}

export interface NewClassSubject {
  institutionId: string;
  classId: string;
  subjectId: string;
  role: ClassSubjectRole;
}

export interface ClassSubjectWithSubject {
  link: ClassSubject;
  subject: Subject;
}

/** A subject offered in the class a section belongs to; enrolment validates choices against these. */
export interface OfferedSubject {
  subjectId: string;
  role: ClassSubjectRole;
  religion: Religion | null;
}
