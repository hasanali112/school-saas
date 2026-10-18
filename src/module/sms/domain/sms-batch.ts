import type { SmsBatchStatus, SmsMessageStatus, SmsPurpose } from './sms';

/**
 * A composed send. The cost preview is stored on the draft so what the office
 * confirms is exactly what gets charged (Spec v2 §9, cost before send).
 */
export interface SmsBatch {
  id: string;
  institutionId: string;
  purpose: SmsPurpose;
  status: SmsBatchStatus;
  templateKey: string | null;
  /** The message as composed, before merge fields. */
  body: string;
  /** Lets automatic drafts (absence for a section-day) replace themselves instead of piling up. */
  dedupeKey: string | null;
  recipientCount: number;
  segmentCount: number;
  costPaisa: number;
  sentCount: number;
  failedCount: number;
  /** Null when the system drafted it (absence listener). */
  createdBy: string | null;
  sentBy: string | null;
  sentAt: Date | null;
  createdAt: Date;
}

export interface NewSmsBatch {
  institutionId: string;
  purpose: SmsPurpose;
  templateKey: string | null;
  body: string;
  dedupeKey: string | null;
  recipientCount: number;
  segmentCount: number;
  costPaisa: number;
  createdBy: string | null;
}

/** One row per recipient: the delivery log. */
export interface SmsMessage {
  id: string;
  institutionId: string;
  batchId: string;
  guardianId: string | null;
  studentId: string | null;
  phone: string;
  body: string;
  segments: number;
  costPaisa: number;
  status: SmsMessageStatus;
  gateway: string | null;
  providerMessageId: string | null;
  error: string | null;
  sentAt: Date | null;
  deliveredAt: Date | null;
  createdAt: Date;
}

/** A message as drafted; the repository fills in the batch and institution. */
export interface DraftMessage {
  phone: string;
  guardianId: string | null;
  studentId: string | null;
  body: string;
  segments: number;
  costPaisa: number;
}

/** The outcome of handing one message to the gateway. */
export interface MessageResult {
  id: string;
  status: SmsMessageStatus.Sent | SmsMessageStatus.Failed;
  gateway: string | null;
  providerMessageId: string | null;
  error: string | null;
}

export interface FinishPatch {
  status: SmsBatchStatus.Sent | SmsBatchStatus.Failed;
  sentCount: number;
  failedCount: number;
  sentBy: string;
}

export interface BatchFilter {
  status?: SmsBatchStatus;
  purpose?: SmsPurpose;
}
