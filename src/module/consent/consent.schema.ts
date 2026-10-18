import {
  boolean,
  foreignKey,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { institutions } from '../institutions/institutions.schema';
import { guardians } from '../students/students.schema';

/** Purposes from PDPA 2026 / Spec v2 §6.23. SMS gates every F1-12 audience. */
export const consentPurpose = pgEnum('consent_purpose', [
  'sms',
  'app',
  'ai_processing',
  'photo',
]);
export const consentSource = pgEnum('consent_source', [
  'app',
  'paper',
  'phone',
  'office',
]);

/**
 * One row per guardian per purpose (F1-15, minimal form). A missing row means no
 * consent. The notice version is kept so a new notice can mark rows for renewal later.
 */
export const consents = pgTable(
  'consents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    institutionId: uuid('institution_id')
      .notNull()
      .references(() => institutions.id),
    guardianId: uuid('guardian_id').notNull(),
    purpose: consentPurpose('purpose').notNull(),
    granted: boolean('granted').notNull(),
    noticeVersion: text('notice_version').notNull(),
    source: consentSource('source').notNull(),
    /** Null when the guardian consented themselves through the app. */
    recordedBy: uuid('recorded_by'),
    /** Paper reference or free note. */
    note: text('note'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    foreignKey({
      name: 'consents_guardian_fk',
      columns: [t.institutionId, t.guardianId],
      foreignColumns: [guardians.institutionId, guardians.id],
    }).onDelete('cascade'),
    uniqueIndex('consents_guardian_purpose_uq').on(
      t.institutionId,
      t.guardianId,
      t.purpose,
    ),
  ],
);

export type ConsentRow = typeof consents.$inferSelect;
export type NewConsentRow = typeof consents.$inferInsert;
