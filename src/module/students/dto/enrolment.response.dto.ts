import { EnrolmentRow, StudentRow } from '@database/schema';

export class EnrolmentResponseDto {
  readonly id: string;
  readonly studentId: string;
  readonly sessionId: string;
  readonly sectionId: string;
  readonly rollNo: number;
  readonly fourthSubjectId: string | null;
  readonly religionSubjectId: string | null;

  private constructor(row: EnrolmentRow) {
    this.id = row.id;
    this.studentId = row.studentId;
    this.sessionId = row.sessionId;
    this.sectionId = row.sectionId;
    this.rollNo = row.rollNo;
    this.fourthSubjectId = row.fourthSubjectId;
    this.religionSubjectId = row.religionSubjectId;
  }

  static from(row: EnrolmentRow): EnrolmentResponseDto {
    return new EnrolmentResponseDto(row);
  }

  static fromMany(rows: readonly EnrolmentRow[]): EnrolmentResponseDto[] {
    return rows.map((row) => EnrolmentResponseDto.from(row));
  }
}

/** One line of a section roster: what attendance and marks entry render per row. */
export class RosterEntryDto {
  readonly enrolmentId: string;
  readonly studentId: string;
  readonly rollNo: number;
  readonly admissionNo: string;
  readonly nameBn: string;
  readonly nameEn: string;
  readonly status: StudentRow['status'];

  private constructor(enrolment: EnrolmentRow, student: StudentRow) {
    this.enrolmentId = enrolment.id;
    this.studentId = student.id;
    this.rollNo = enrolment.rollNo;
    this.admissionNo = student.admissionNo;
    this.nameBn = student.nameBn;
    this.nameEn = student.nameEn;
    this.status = student.status;
  }

  static from(enrolment: EnrolmentRow, student: StudentRow): RosterEntryDto {
    return new RosterEntryDto(enrolment, student);
  }
}

export class RosterResponseDto {
  constructor(
    readonly sectionId: string,
    readonly sessionId: string,
    readonly students: RosterEntryDto[],
  ) {}
}
