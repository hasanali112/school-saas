import {
  ClassSubjectRow,
  HolidayRow,
  SectionClassTeacherRow,
  SubjectRow,
  TeacherAssignmentRow,
} from '@database/schema';

export class SubjectResponseDto {
  readonly id: string;
  readonly code: string;
  readonly nameBn: string;
  readonly nameEn: string;
  readonly kind: SubjectRow['kind'];
  readonly religion: SubjectRow['religion'];

  private constructor(row: SubjectRow) {
    this.id = row.id;
    this.code = row.code;
    this.nameBn = row.nameBn;
    this.nameEn = row.nameEn;
    this.kind = row.kind;
    this.religion = row.religion;
  }

  static from(row: SubjectRow): SubjectResponseDto {
    return new SubjectResponseDto(row);
  }

  static fromMany(rows: readonly SubjectRow[]): SubjectResponseDto[] {
    return rows.map((row) => SubjectResponseDto.from(row));
  }
}

/** A subject as offered in one class: the mapping row plus the subject itself. */
export class ClassSubjectResponseDto {
  readonly id: string;
  readonly classId: string;
  readonly role: ClassSubjectRow['role'];
  readonly subject: SubjectResponseDto;

  private constructor(link: ClassSubjectRow, subject: SubjectRow) {
    this.id = link.id;
    this.classId = link.classId;
    this.role = link.role;
    this.subject = SubjectResponseDto.from(subject);
  }

  static from(
    link: ClassSubjectRow,
    subject: SubjectRow,
  ): ClassSubjectResponseDto {
    return new ClassSubjectResponseDto(link, subject);
  }
}

export class TeacherAssignmentResponseDto {
  readonly id: string;
  readonly sessionId: string;
  readonly sectionId: string;
  readonly subjectId: string;
  readonly teacherUserId: string;

  private constructor(row: TeacherAssignmentRow) {
    this.id = row.id;
    this.sessionId = row.sessionId;
    this.sectionId = row.sectionId;
    this.subjectId = row.subjectId;
    this.teacherUserId = row.teacherUserId;
  }

  static from(row: TeacherAssignmentRow): TeacherAssignmentResponseDto {
    return new TeacherAssignmentResponseDto(row);
  }

  static fromMany(
    rows: readonly TeacherAssignmentRow[],
  ): TeacherAssignmentResponseDto[] {
    return rows.map((row) => TeacherAssignmentResponseDto.from(row));
  }
}

export class ClassTeacherResponseDto {
  readonly sessionId: string;
  readonly sectionId: string;
  readonly teacherUserId: string;

  private constructor(row: SectionClassTeacherRow) {
    this.sessionId = row.sessionId;
    this.sectionId = row.sectionId;
    this.teacherUserId = row.teacherUserId;
  }

  static from(row: SectionClassTeacherRow): ClassTeacherResponseDto {
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
  readonly kind: HolidayRow['kind'];

  private constructor(row: HolidayRow) {
    this.id = row.id;
    this.date = row.date;
    this.nameBn = row.nameBn;
    this.nameEn = row.nameEn;
    this.kind = row.kind;
  }

  static from(row: HolidayRow): HolidayResponseDto {
    return new HolidayResponseDto(row);
  }

  static fromMany(rows: readonly HolidayRow[]): HolidayResponseDto[] {
    return rows.map((row) => HolidayResponseDto.from(row));
  }
}
