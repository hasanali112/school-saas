import {
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

export const userStatus = pgEnum('user_status', ['active', 'disabled']);

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    institutionId: uuid('institution_id')
      .notNull()
      .references(() => institutions.id),
    phone: text('phone').notNull(),
    name: text('name').notNull(),
    /** Null for OTP-only accounts (guardians). */
    passwordHash: text('password_hash'),
    /** Values from the Role enum. Array because one person often holds two roles. */
    roles: text('roles').array().notNull(),
    status: userStatus('status').notNull().default('active'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    /** Target for composite tenant-scoped foreign keys (see academics.ts). */
    unique('users_tenant_key').on(t.institutionId, t.id),
    uniqueIndex('users_institution_phone_uq').on(t.institutionId, t.phone),
    index('users_phone_idx').on(t.phone),
  ],
);

/** Pre-auth only: no institution column, no RLS policy, reachable solely via the system role. */
export const otpCodes = pgTable(
  'otp_codes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    codeHash: text('code_hash').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    attempts: integer('attempts').notNull().default(0),
    consumedAt: timestamp('consumed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index('otp_codes_user_idx').on(t.userId)],
);

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
export type OtpCodeRow = typeof otpCodes.$inferSelect;
