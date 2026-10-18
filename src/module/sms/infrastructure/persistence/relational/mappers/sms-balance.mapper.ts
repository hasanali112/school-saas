import type { SmsBalance } from '../../../../domain/sms-balance';
import { SmsBalanceEntity } from '../entities/sms-balance.entity';

/** Converts between the `SmsBalance` domain type and its TypeORM row. */
export class SmsBalanceMapper {
  static toDomain(entity: SmsBalanceEntity): SmsBalance {
    return {
      institutionId: entity.institutionId,
      balancePaisa: entity.balancePaisa,
      ratePaisaPerSegment: entity.ratePaisaPerSegment,
      updatedAt: entity.updatedAt,
    };
  }
}
