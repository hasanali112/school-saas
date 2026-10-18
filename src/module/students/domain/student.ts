import { Religion } from '@module/academics/domain/subject';

export enum StudentStatus {
  Active = 'active',
  Promoted = 'promoted',
  Transferred = 'transferred',
  Exited = 'exited',
}

export enum Gender {
  Male = 'male',
  Female = 'female',
  Other = 'other',
}

export enum BloodGroup {
  APos = 'A+',
  ANeg = 'A-',
  BPos = 'B+',
  BNeg = 'B-',
  ABPos = 'AB+',
  ABNeg = 'AB-',
  OPos = 'O+',
  ONeg = 'O-',
}

/** The digital admission register (F1-03). Per-session roll and section live on enrolments. */
export interface Student {
  id: string;
  institutionId: string;
  admissionNo: string;
  nameBn: string;
  nameEn: string;
  dateOfBirth: string | null;
  gender: Gender | null;
  bloodGroup: BloodGroup | null;
  religion: Religion | null;
  birthCertificateNo: string | null;
  addressBn: string | null;
  addressEn: string | null;
  /** Object-store key; the file itself never goes through the API row. */
  photoKey: string | null;
  status: StudentStatus;
  exitedAt: Date | null;
  exitReason: string | null;
  createdAt: Date;
}

/** The fields an admission form (or an import row) provides. */
export interface StudentDetails {
  admissionNo: string;
  nameBn: string;
  nameEn: string;
  dateOfBirth?: string;
  gender?: Gender;
  bloodGroup?: BloodGroup;
  religion?: Religion;
  birthCertificateNo?: string;
  addressBn?: string;
  addressEn?: string;
}

export interface NewStudent extends StudentDetails {
  institutionId: string;
}

export interface StudentPatch {
  nameBn?: string;
  nameEn?: string;
  dateOfBirth?: string;
  gender?: Gender;
  bloodGroup?: BloodGroup;
  religion?: Religion;
  birthCertificateNo?: string;
  addressBn?: string;
  addressEn?: string;
  status?: StudentStatus;
  exitedAt?: Date;
  exitReason?: string;
}

export interface StudentFilter {
  search?: string;
  status?: StudentStatus;
}
