import type { Role } from '@common/types/role';
import type { MergeValues } from './template-render';

export interface GuardianFilter {
  sessionId: string;
  classId?: string;
  sectionId?: string;
  studentIds?: string[];
}

/** The primary guardian of an active student, with the merge fields an SMS can use. */
export interface GuardianRecipient {
  studentId: string;
  studentNameBn: string;
  studentNameEn: string;
  rollNo: number;
  className: string;
  sectionName: string;
  guardianId: string;
  guardianName: string;
  phone: string;
  /** Null when the guardian has never been asked. */
  smsConsent: boolean | null;
}

export interface StaffRecipient {
  userId: string;
  name: string;
  phone: string;
}

export interface Recipient {
  phone: string;
  guardianId?: string;
  studentId?: string;
  userId?: string;
  /** Per-recipient merge values; the composer adds the shared ones (date, institution). */
  fields: MergeValues;
}

/** Recipients dropped by the builder, by reason, so the preview can show them. */
export interface AudienceExclusions {
  noConsent: number;
}

export interface ResolvedAudience {
  recipients: Recipient[];
  excluded: AudienceExclusions;
}

/** Who to reach; any combination. */
export interface AudienceSelection {
  classId?: string;
  sectionId?: string;
  studentIds?: string[];
  roles?: Role[];
  phones?: string[];
}
