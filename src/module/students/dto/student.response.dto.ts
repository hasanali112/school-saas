import { StudentRow } from '@database/schema';

/** What leaves the API. Mapping here keeps audit columns and internal fields out of responses. */
export class StudentResponseDto {
  readonly id: string;
  readonly admissionNo: string;
  readonly nameBn: string;
  readonly nameEn: string;
  readonly dateOfBirth: string | null;
  readonly gender: StudentRow['gender'];
  readonly bloodGroup: StudentRow['bloodGroup'];
  readonly religion: StudentRow['religion'];
  readonly birthCertificateNo: string | null;
  readonly addressBn: string | null;
  readonly addressEn: string | null;
  readonly status: StudentRow['status'];
  readonly exitedAt: Date | null;
  readonly exitReason: string | null;
  readonly createdAt: Date;

  private constructor(row: StudentRow) {
    this.id = row.id;
    this.admissionNo = row.admissionNo;
    this.nameBn = row.nameBn;
    this.nameEn = row.nameEn;
    this.dateOfBirth = row.dateOfBirth;
    this.gender = row.gender;
    this.bloodGroup = row.bloodGroup;
    this.religion = row.religion;
    this.birthCertificateNo = row.birthCertificateNo;
    this.addressBn = row.addressBn;
    this.addressEn = row.addressEn;
    this.status = row.status;
    this.exitedAt = row.exitedAt;
    this.exitReason = row.exitReason;
    this.createdAt = row.createdAt;
  }

  static from(row: StudentRow): StudentResponseDto {
    return new StudentResponseDto(row);
  }

  static fromMany(rows: readonly StudentRow[]): StudentResponseDto[] {
    return rows.map((row) => StudentResponseDto.from(row));
  }
}
