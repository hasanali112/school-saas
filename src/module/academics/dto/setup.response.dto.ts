import { HolidayKind } from '../domain/holiday';
import type { Holiday } from '../domain/holiday';
import { ClassSubjectRole, Religion, SubjectKind } from '../domain/subject';
import type { ClassSubject, Subject } from '../domain/subject';
import type {
  SectionClassTeacher,
  TeacherAssignment,
} from '../domain/teacher-assignment';

export class SubjectResponseDto {
  readonly id: string;
  readonly code: string;
  readonly nameBn: string;
  readonly nameEn: string;
  readonly kind: SubjectKind;
  readonly religion: Religion | null;

  private constructor(row: Subject) {
    this.id = row.id;
    this.code = row.code;
    this.nameBn = row.nameBn;
    this.nameEn = row.nameEn;
    this.kind = row.kind;
    this.religion = row.religion;
  }

  static from(row: Subject): SubjectResponseDto {
    return new SubjectResponseDto(row);
  }

  static fromMany(rows: readonly Subject[]): SubjectResponseDto[] {
    return rows.map((row) => SubjectResponseDto.from(row));
  }
}

/** A subject as offered in one class: the mapping row plus the subject itself. */
export class ClassSubjectResponseDto {
  readonly id: string;
  readonly classId: string;
  readonly role: ClassSubjectRole;
  readonly subject: SubjectResponseDto;

  private constructor(link: ClassSubject, subject: Subject) {
    this.id = link.id;
    this.classId = link.classId;
    this.role = link.role;
    this.subject = SubjectResponseDto.from(subject);
  }

  static from(link: ClassSubject, subject: Subject): ClassSubjectResponseDto {
    return new ClassSubjectResponseDto(link, subject);
  }
}

export class TeacherAssignmentResponseDto {
  readonly id: string;
  readonly sessionId: string;
  readonly sectionId: string;
  readonly subjectId: string;
  readonly teacherUserId: string;

  private constructor(row: TeacherAssignment) {
    this.id = row.id;
    this.sessionId = row.sessionId;
    this.sectionId = row.sectionId;
    this.subjectId = row.subjectId;
    this.teacherUserId = row.teacherUserId;
  }

  static from(row: TeacherAssignment): TeacherAssignmentResponseDto {
    return new TeacherAssignmentResponseDto(row);
  }

  static fromMany(
    rows: readonly TeacherAssignment[],
  ): TeacherAssignmentResponseDto[] {
    return rows.map((row) => TeacherAssignmentResponseDto.from(row));
  }
}

export class ClassTeacherResponseDto {
  readonly sessionId: string;
  readonly sectionId: string;
  readonly teacherUserId: string;

  private constructor(row: SectionClassTeacher) {
    this.sessionId = row.sessionId;
    this.sectionId = row.sectionId;
    this.teacherUserId = row.teacherUserId;
  }

  static from(row: SectionClassTeacher): ClassTeacherResponseDto {
    return new ClassTeacherResponseDto(row);
  }
}

/** Everything about who teaches a section in a session, in one response. */
export class SectionTeachersResponseDto {
  constructor(
    readonly sectionId: string,
    readonly sessionId: string,
    readonly classTeacher: ClassTeacherResponseDto | null,
    readonly subjectTeachers: TeacherAssignmentResponseDto[],
  ) {}
}

/** What the logged-in teacher is responsible for; drives "assigned classes only" rules. */
export class MyAssignmentsResponseDto {
  constructor(
    readonly sessionId: string,
    readonly classTeacherOf: string[],
    readonly subjectAssignments: TeacherAssignmentResponseDto[],
  ) {}
}

export class HolidayResponseDto {
  readonly id: string;
  readonly date: string;
  readonly nameBn: string;
  readonly nameEn: string;
  readonly kind: HolidayKind;

  private constructor(row: Holiday) {
    this.id = row.id;
    this.date = row.date;
    this.nameBn = row.nameBn;
    this.nameEn = row.nameEn;
    this.kind = row.kind;
  }

  static from(row: Holiday): HolidayResponseDto {
    return new HolidayResponseDto(row);
  }

  static fromMany(rows: readonly Holiday[]): HolidayResponseDto[] {
    return rows.map((row) => HolidayResponseDto.from(row));
  }
}
