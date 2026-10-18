import type { OtpCode } from '../../../../domain/otp-code';
import { OtpCodeEntity } from '../entities/otp-code.entity';

/** Converts between the `OtpCode` domain type and its TypeORM row. */
export class OtpCodeMapper {
  static toDomain(entity: OtpCodeEntity): OtpCode {
    return {
      id: entity.id,
      userId: entity.userId,
      codeHash: entity.codeHash,
      expiresAt: entity.expiresAt,
      attempts: entity.attempts,
      consumedAt: entity.consumedAt,
      createdAt: entity.createdAt,
    };
  }

  static toPersistence(
    userId: string,
    codeHash: string,
    expiresAt: Date,
  ): OtpCodeEntity {
    const entity = new OtpCodeEntity();
    entity.userId = userId;
    entity.codeHash = codeHash;
    entity.expiresAt = expiresAt;
    return entity;
  }
}
