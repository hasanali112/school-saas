import { GuardianRow, StudentGuardianRow, StudentRow } from '@database/schema';

export class StudentGuardianResponseDto {
  readonly guardianId: string;
  readonly phone: string;
  readonly name: string;
  readonly relation: StudentGuardianRow['relation'];
  readonly isPrimary: boolean;

  private constructor(link: StudentGuardianRow, guardian: GuardianRow) {
    this.guardianId = guardian.id;
    this.phone = guardian.phone;
    this.name = guardian.name;
    this.relation = link.relation;
    this.isPrimary = link.isPrimary;
  }

  static from(
    link: StudentGuardianRow,
    guardian: GuardianRow,
  ): StudentGuardianResponseDto {
    return new StudentGuardianResponseDto(link, guardian);
  }
}

/** A guardian's children: the shape the guardian app's child selector needs. */
export class GuardianChildDto {
  readonly studentId: string;
  readonly admissionNo: string;
  readonly nameBn: string;
  readonly nameEn: string;
  readonly relation: StudentGuardianRow['relation'];

  private constructor(link: StudentGuardianRow, student: StudentRow) {
    this.studentId = student.id;
    this.admissionNo = student.admissionNo;
    this.nameBn = student.nameBn;
    this.nameEn = student.nameEn;
    this.relation = link.relation;
  }

  static from(link: StudentGuardianRow, student: StudentRow): GuardianChildDto {
    return new GuardianChildDto(link, student);
  }
}
