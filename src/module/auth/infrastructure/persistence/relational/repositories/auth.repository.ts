import { Injectable } from '@nestjs/common';
import { IsNull, MoreThan } from 'typeorm';
import { DatabaseService } from '@common/services/database/database.service';
import { InstitutionEntity } from '@module/institutions/infrastructure/persistence/relational/entities/institution.entity';
import type { User } from '@module/users/domain/user';
import { UserEntity } from '@module/users/infrastructure/persistence/relational/entities/user.entity';
import { UserMapper } from '@module/users/infrastructure/persistence/relational/mappers/user.mapper';
import type { OtpCode } from '../../../../domain/otp-code';
import { AuthRepository } from '../../../../application/ports/auth.repository.port';
import { OtpCodeEntity } from '../entities/otp-code.entity';
import { OtpCodeMapper } from '../mappers/otp-code.mapper';

/**
 * Pre-auth queries run through `system()` because no tenant is known yet. Keep this
 * file small and reviewable: it is the only place that reads users across tenants.
 * It reads the users and institutions tables but never writes them.
 */
@Injectable()
export class AuthRelationalRepository implements AuthRepository {
  constructor(private readonly db: DatabaseService) {}

  async findLoginUser(
    institutionSlug: string,
    phone: string,
  ): Promise<User | undefined> {
    const user = await this.db.system((m) =>
      m
        .createQueryBuilder(UserEntity, 'u')
        .innerJoin(InstitutionEntity, 'i', 'i.id = u.institutionId')
        .where('i.slug = :institutionSlug', { institutionSlug })
        .andWhere('u.phone = :phone', { phone })
        .getOne(),
    );
    return user ? UserMapper.toDomain(user) : undefined;
  }

  async replaceOtp(
    userId: string,
    codeHash: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.db.system(async (m) => {
      await m.delete(OtpCodeEntity, { userId, consumedAt: IsNull() });
      await m.save(OtpCodeMapper.toPersistence(userId, codeHash, expiresAt));
    });
  }

  async findActiveOtp(userId: string): Promise<OtpCode | undefined> {
    const otp = await this.db.system((m) =>
      m.findOne(OtpCodeEntity, {
        where: {
          userId,
          consumedAt: IsNull(),
          expiresAt: MoreThan(new Date()),
        },
        order: { createdAt: 'DESC' },
      }),
    );
    return otp ? OtpCodeMapper.toDomain(otp) : undefined;
  }

  recordAttempt(id: string): Promise<number> {
    return this.db.system(async (m) => {
      await m.increment(OtpCodeEntity, { id }, 'attempts', 1);
      const otp = await m.findOneByOrFail(OtpCodeEntity, { id });
      return otp.attempts;
    });
  }

  async consumeOtp(id: string): Promise<void> {
    await this.db.system((m) =>
      m.update(OtpCodeEntity, { id }, { consumedAt: new Date() }),
    );
  }

  /** Post-auth, tenant-scoped. */
  async findCurrentUser(id: string): Promise<User | undefined> {
    const user = await this.db.tenant((m) => m.findOneBy(UserEntity, { id }));
    return user ? UserMapper.toDomain(user) : undefined;
  }
}
