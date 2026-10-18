import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const institutions = pgTable('institutions', {
  id: uuid('id').primaryKey().defaultRandom(),
  /** URL-safe identifier used on the public website and at login to pick the tenant. */
  slug: text('slug').notNull().unique(),
  nameBn: text('name_bn').notNull(),
  nameEn: text('name_en').notNull(),
  eiin: text('eiin').unique(),
  addressBn: text('address_bn'),
  addressEn: text('address_en'),
  phone: text('phone'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type InstitutionRow = typeof institutions.$inferSelect;
export type NewInstitutionRow = typeof institutions.$inferInsert;
