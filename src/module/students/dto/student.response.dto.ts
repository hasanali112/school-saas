import { Religion } from '@module/academics/domain/subject';
import { BloodGroup, Gender, StudentStatus } from '../domain/student';
import type { Student } from '../domain/student';

/** What leaves the API. Mapping here keeps audit columns and internal fields out of responses. */
export class StudentResponseDto {
  readonly id: string;
  readonly admissionNo: string;
  readonly nameBn: string;
  readonly nameEn: string;
  readonly dateOfBirth: string | null;
  readonly gender: Gender | null;
  readonly bloodGroup: BloodGroup | null;
  readonly religion: Religion | null;
  readonly birthCertificateNo: string | null;
  readonly addressBn: string | null;
  readonly addressEn: string | null;
  readonly status: StudentStatus;
  readonly exitedAt: Date | null;
  readonly exitReason: string | null;
  readonly createdAt: Date;

  private constructor(student: Student) {
    this.id = student.id;
    this.admissionNo = student.admissionNo;
    this.nameBn = student.nameBn;
    this.nameEn = student.nameEn;
    this.dateOfBirth = student.dateOfBirth;
    this.gender = student.gender;
    this.bloodGroup = student.bloodGroup;
    this.religion = student.religion;
    this.birthCertificateNo = student.birthCertificateNo;
    this.addressBn = student.addressBn;
    this.addressEn = student.addressEn;
    this.status = student.status;
    this.exitedAt = student.exitedAt;
    this.exitReason = student.exitReason;
    this.createdAt = student.createdAt;
  }

  static from(student: Student): StudentResponseDto {
    return new StudentResponseDto(student);
  }

  static fromMany(students: readonly Student[]): StudentResponseDto[] {
    return students.map((student) => StudentResponseDto.from(student));
  }
}
