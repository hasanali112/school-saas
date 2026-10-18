import type { User } from '@module/users/domain/user';
import type { OtpCode } from '../../domain/otp-code';

/**
 * Pre-auth lookups run without a tenant (system role); `findCurrentUser` runs
 * after auth and is tenant-scoped.
 */
export abstract class AuthRepository {
  /** Resolves tenant and user in one round trip. */
  abstract findLoginUser(
    institutionSlug: string,
    phone: string,
  ): Promise<User | undefined>;
  /** One live code per user: earlier unconsumed codes are dropped. */
  abstract replaceOtp(
    userId: string,
    codeHash: string,
    expiresAt: Date,
  ): Promise<void>;
  abstract findActiveOtp(userId: string): Promise<OtpCode | undefined>;
  /** Atomic increment; returns the new count so the caller can enforce the cap. */
  abstract recordAttempt(id: string): Promise<number>;
  abstract consumeOtp(id: string): Promise<void>;
  abstract findCurrentUser(id: string): Promise<User | undefined>;
}
