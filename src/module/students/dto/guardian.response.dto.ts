import { GuardianRelation } from '../domain/guardian';
import type { Guardian, StudentGuardian } from '../domain/guardian';
import type { Student } from '../domain/student';

export class StudentGuardianResponseDto {
  readonly guardianId: string;
  readonly phone: string;
  readonly name: string;
  readonly relation: GuardianRelation;
  readonly isPrimary: boolean;

  private constructor(link: StudentGuardian, guardian: Guardian) {
    this.guardianId = guardian.id;
    this.phone = guardian.phone;
    this.name = guardian.name;
    this.relation = link.relation;
    this.isPrimary = link.isPrimary;
  }

  static from(
    link: StudentGuardian,
    guardian: Guardian,
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
  readonly relation: GuardianRelation;

  private constructor(link: StudentGuardian, student: Student) {
    this.studentId = student.id;
    this.admissionNo = student.admissionNo;
    this.nameBn = student.nameBn;
    this.nameEn = student.nameEn;
    this.relation = link.relation;
  }

  static from(link: StudentGuardian, student: Student): GuardianChildDto {
    return new GuardianChildDto(link, student);
  }
}
