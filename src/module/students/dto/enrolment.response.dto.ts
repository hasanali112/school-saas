import type { Enrolment, RosterEntry } from '../domain/enrolment';
import { StudentStatus } from '../domain/student';

export class EnrolmentResponseDto {
  readonly id: string;
  readonly studentId: string;
  readonly sessionId: string;
  readonly sectionId: string;
  readonly rollNo: number;
  readonly fourthSubjectId: string | null;
  readonly religionSubjectId: string | null;

  private constructor(enrolment: Enrolment) {
    this.id = enrolment.id;
    this.studentId = enrolment.studentId;
    this.sessionId = enrolment.sessionId;
    this.sectionId = enrolment.sectionId;
    this.rollNo = enrolment.rollNo;
    this.fourthSubjectId = enrolment.fourthSubjectId;
    this.religionSubjectId = enrolment.religionSubjectId;
  }

  static from(enrolment: Enrolment): EnrolmentResponseDto {
    return new EnrolmentResponseDto(enrolment);
  }

  static fromMany(enrolments: readonly Enrolment[]): EnrolmentResponseDto[] {
    return enrolments.map((enrolment) => EnrolmentResponseDto.from(enrolment));
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
  readonly status: StudentStatus;

  private constructor(entry: RosterEntry) {
    this.enrolmentId = entry.enrolmentId;
    this.studentId = entry.studentId;
    this.rollNo = entry.rollNo;
    this.admissionNo = entry.admissionNo;
    this.nameBn = entry.nameBn;
    this.nameEn = entry.nameEn;
    this.status = entry.status;
  }

  static from(entry: RosterEntry): RosterEntryDto {
    return new RosterEntryDto(entry);
  }
}

export class RosterResponseDto {
  constructor(
    readonly sectionId: string,
    readonly sessionId: string,
    readonly students: RosterEntryDto[],
  ) {}
}
