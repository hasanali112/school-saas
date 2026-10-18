/** Who teaches a subject in a section for a session. */
export interface TeacherAssignment {
  id: string;
  institutionId: string;
  sessionId: string;
  sectionId: string;
  subjectId: string;
  teacherUserId: string;
  createdAt: Date;
}

export interface NewTeacherAssignment {
  institutionId: string;
  sessionId: string;
  sectionId: string;
  subjectId: string;
  teacherUserId: string;
}

/** The one class teacher of a section for a session. */
export interface SectionClassTeacher {
  id: string;
  institutionId: string;
  sessionId: string;
  sectionId: string;
  teacherUserId: string;
  createdAt: Date;
}

export interface NewSectionClassTeacher {
  institutionId: string;
  sessionId: string;
  sectionId: string;
  teacherUserId: string;
}

export interface SectionTeachers {
  classTeacher: SectionClassTeacher | undefined;
  subjectTeachers: TeacherAssignment[];
}

export interface TeacherWorkload {
  classTeacherOf: SectionClassTeacher[];
  subjectAssignments: TeacherAssignment[];
}
