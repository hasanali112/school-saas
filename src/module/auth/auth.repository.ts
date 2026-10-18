import { Injectable } from '@nestjs/common';
import { and, desc, eq, gt, isNull, sql } from 'drizzle-orm';
import { DatabaseService } from '@database/database.service';
import {
  institutions,
  OtpCodeRow,
  otpCodes,
  UserRow,
  users,
} from '@database/schema';

/**
 * Pre-auth queries run through `system()` because no tenant is known yet.
 * Keep this file small and reviewable: it is the only place that reads
 * users or OTP codes across tenants.
 */
@Injectable()
export class AuthRepository {
  constructor(private readonly database: DatabaseService) {}

  /** Resolve tenant and user in one round trip. */
  findLoginUser(
    institutionSlug: string,
    phone: string,
  ): Promise<UserRow | undefined> {
    return this.database.system(async (tx) => {
      const [row] = await tx
        .select({ user: users })
        .from(users)
        .innerJoin(institutions, eq(institutions.id, users.institutionId))
        .where(
          and(eq(institutions.slug, institutionSlug), eq(users.phone, phone)),
        )
        .limit(1);
      return row?.user;
    });
  }

  /** One live code per user: earlier unconsumed codes are dropped. */
  replaceOtp(userId: string, codeHash: string, expiresAt: Date): Promise<void> {
    return this.database.system(async (tx) => {
      await tx
        .delete(otpCodes)
        .where(and(eq(otpCodes.userId, userId), isNull(otpCodes.consumedAt)));
      await tx.insert(otpCodes).values({ userId, codeHash, expiresAt });
    });
  }

  findActiveOtp(userId: string): Promise<OtpCodeRow | undefined> {
    return this.database.system(async (tx) => {
      const [row] = await tx
        .select()
        .from(otpCodes)
        .where(
          and(
            eq(otpCodes.userId, userId),
            isNull(otpCodes.consumedAt),
            gt(otpCodes.expiresAt, new Date()),
          ),
        )
        .orderBy(desc(otpCodes.createdAt))
        .limit(1);
      return row;
    });
  }

  /** Atomic increment; returns the new count so the caller can enforce the cap. */
  recordAttempt(id: string): Promise<number> {
    return this.database.system(async (tx) => {
      const [row] = await tx
        .update(otpCodes)
        .set({ attempts: sql`${otpCodes.attempts} + 1` })
        .where(eq(otpCodes.id, id))
        .returning({ attempts: otpCodes.attempts });
      return row.attempts;
    });
  }

  consumeOtp(id: string): Promise<void> {
    return this.database.system(async (tx) => {
      await tx
        .update(otpCodes)
        .set({ consumedAt: new Date() })
        .where(eq(otpCodes.id, id));
    });
  }

  /** Post-auth, tenant-scoped. */
  findCurrentUser(id: string): Promise<UserRow | undefined> {
    return this.database.tenant((tx) =>
      tx.query.users.findFirst({ where: eq(users.id, id) }),
    );
  }
}
