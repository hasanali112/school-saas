import { sql } from 'drizzle-orm';
import {
  foreignKey,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { institutions } from '../institutions/institutions.schema';
import { guardians, students } from '../students/students.schema';

const institutionRef = () =>
  uuid('institution_id')
    .notNull()
    .references(() => institutions.id);

export const smsPurpose = pgEnum('sms_purpose', [
  'absence',
  'due_reminder',
  'result',
  'admission',
  'general',
]);
export const smsBatchStatus = pgEnum('sms_batch_status', [
  'draft',
  'sending',
  'sent',
  'failed',
  'cancelled',
]);
export const smsMessageStatus = pgEnum('sms_message_status', [
  'pending',
  'sent',
  'delivered',
  'failed',
]);
export const smsLedgerKind = pgEnum('sms_ledger_kind', [
  'top_up',
  'send',
  'refund',
  'adjustment',
]);

/** Institution-owned message templates with `{{field}}` merge fields; keyed so consumers find them. */
export const smsTemplates = pgTable(
  'sms_templates',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    institutionId: institutionRef(),
    key: text('key').notNull(),
    name: text('name').notNull(),
    body: text('body').notNull(),
    updatedBy: uuid('updated_by'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex('sms_templates_key_uq').on(t.institutionId, t.key)],
);

/**
 * A composed send: the cost preview is persisted on the draft so what the office
 * confirms is exactly what gets charged (Spec v2 §9, cost before send).
 */
export const smsBatches = pgTable(
  'sms_batches',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    institutionId: institutionRef(),
    purpose: smsPurpose('purpose').notNull(),
    status: smsBatchStatus('status').notNull().default('draft'),
    templateKey: text('template_key'),
    /** The message as composed, before merge fields. */
    body: text('body').notNull(),
    /** Lets automatic drafts (absence for a section-day) replace themselves instead of piling up. */
    dedupeKey: text('dedupe_key'),
    recipientCount: integer('recipient_count').notNull(),
    segmentCount: integer('segment_count').notNull(),
    costPaisa: integer('cost_paisa').notNull(),
    sentCount: integer('sent_count').notNull().default(0),
    failedCount: integer('failed_count').notNull().default(0),
    /** Null when the system drafted it (absence listener). */
    createdBy: uuid('created_by'),
    sentBy: uuid('sent_by'),
    sentAt: timestamp('sent_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique('sms_batches_tenant_key').on(t.institutionId, t.id),
    uniqueIndex('sms_batches_dedupe_uq')
      .on(t.institutionId, t.dedupeKey)
      .where(sql`${t.dedupeKey} is not null`),
    index('sms_batches_status_idx').on(t.institutionId, t.status, t.createdAt),
  ],
);

/** One row per recipient: the delivery log. */
export const smsMessages = pgTable(
  'sms_messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    institutionId: institutionRef(),
    batchId: uuid('batch_id').notNull(),
    guardianId: uuid('guardian_id'),
    studentId: uuid('student_id'),
    phone: text('phone').notNull(),
    body: text('body').notNull(),
    segments: integer('segments').notNull(),
    costPaisa: integer('cost_paisa').notNull(),
    status: smsMessageStatus('status').notNull().default('pending'),
    gateway: text('gateway'),
    providerMessageId: text('provider_message_id'),
    error: text('error'),
    sentAt: timestamp('sent_at', { withTimezone: true }),
    deliveredAt: timestamp('delivered_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    foreignKey({
      name: 'sms_messages_batch_fk',
      columns: [t.institutionId, t.batchId],
      foreignColumns: [smsBatches.institutionId, smsBatches.id],
    }).onDelete('cascade'),
    foreignKey({
      name: 'sms_messages_guardian_fk',
      columns: [t.institutionId, t.guardianId],
      foreignColumns: [guardians.institutionId, guardians.id],
    }).onDelete('set null'),
    foreignKey({
      name: 'sms_messages_student_fk',
      columns: [t.institutionId, t.studentId],
      foreignColumns: [students.institutionId, students.id],
    }).onDelete('set null'),
    index('sms_messages_batch_idx').on(t.institutionId, t.batchId),
    index('sms_messages_provider_idx').on(t.providerMessageId),
  ],
);

/** Current balance per institution; debited atomically on send. */
export const smsBalances = pgTable('sms_balances', {
  institutionId: uuid('institution_id')
    .primaryKey()
    .references(() => institutions.id),
  balancePaisa: integer('balance_paisa').notNull().default(0),
  /** Null = the platform default (SMS_SEGMENT_COST_PAISA). */
  ratePaisaPerSegment: integer('rate_paisa_per_segment'),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Append-only history behind the balance: top-ups, sends, refunds for failed messages. */
export const smsLedger = pgTable(
  'sms_ledger',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    institutionId: institutionRef(),
    kind: smsLedgerKind('kind').notNull(),
    /** Signed: top-ups positive, sends negative. */
    amountPaisa: integer('amount_paisa').notNull(),
    balanceAfterPaisa: integer('balance_after_paisa').notNull(),
    batchId: uuid('batch_id'),
    note: text('note'),
    actorId: uuid('actor_id'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index('sms_ledger_created_idx').on(t.institutionId, t.createdAt)],
);

export type SmsTemplateRow = typeof smsTemplates.$inferSelect;
export type NewSmsTemplateRow = typeof smsTemplates.$inferInsert;
export type SmsBatchRow = typeof smsBatches.$inferSelect;
export type NewSmsBatchRow = typeof smsBatches.$inferInsert;
export type SmsMessageRow = typeof smsMessages.$inferSelect;
export type NewSmsMessageRow = typeof smsMessages.$inferInsert;
export type SmsBalanceRow = typeof smsBalances.$inferSelect;
export type SmsLedgerRow = typeof smsLedger.$inferSelect;
export type NewSmsLedgerRow = typeof smsLedger.$inferInsert;
