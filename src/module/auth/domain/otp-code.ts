/** A hashed one-time login code. Pre-auth only, so it has no institution column. */
export interface OtpCode {
  id: string;
  userId: string;
  codeHash: string;
  expiresAt: Date;
  attempts: number;
  consumedAt: Date | null;
  createdAt: Date;
}
