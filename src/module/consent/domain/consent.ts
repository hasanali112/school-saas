/** Purposes from PDPA 2026 / Spec v2 §6.23. SMS gates every F1-12 audience. */
export enum ConsentPurpose {
  Sms = 'sms',
  App = 'app',
  AiProcessing = 'ai_processing',
  Photo = 'photo',
}

export enum ConsentSource {
  App = 'app',
  Paper = 'paper',
  Phone = 'phone',
  Office = 'office',
}

/**
 * One row per guardian per purpose (F1-15, minimal form). A missing row means no
 * consent. The notice version is kept so a new notice can mark rows for renewal later.
 */
export interface Consent {
  id: string;
  institutionId: string;
  guardianId: string;
  purpose: ConsentPurpose;
  granted: boolean;
  noticeVersion: string;
  source: ConsentSource;
  /** Null when the guardian consented themselves through the app. */
  recordedBy: string | null;
  /** Paper reference or free note. */
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewConsent {
  institutionId: string;
  guardianId: string;
  purpose: ConsentPurpose;
  granted: boolean;
  noticeVersion: string;
  source: ConsentSource;
  recordedBy: string | null;
  note: string | null;
}
