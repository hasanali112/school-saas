export enum SmsPurpose {
  Absence = 'absence',
  DueReminder = 'due_reminder',
  Result = 'result',
  Admission = 'admission',
  General = 'general',
}

export enum SmsBatchStatus {
  Draft = 'draft',
  Sending = 'sending',
  Sent = 'sent',
  Failed = 'failed',
  Cancelled = 'cancelled',
}

export enum SmsMessageStatus {
  Pending = 'pending',
  Sent = 'sent',
  Delivered = 'delivered',
  Failed = 'failed',
}

export enum SmsLedgerKind {
  TopUp = 'top_up',
  Send = 'send',
  Refund = 'refund',
  Adjustment = 'adjustment',
}

/** What a provider's delivery report says happened. */
export enum DeliveryStatus {
  Delivered = 'delivered',
  Failed = 'failed',
}

/** What a gateway hands back after accepting a message. */
export interface SmsDelivery {
  /** Provider-side id when available; delivery reports are matched on it. */
  providerMessageId?: string;
  /** Which adapter delivered (`primary`, `secondary`, `log`), kept on the message log. */
  gateway: string;
}
