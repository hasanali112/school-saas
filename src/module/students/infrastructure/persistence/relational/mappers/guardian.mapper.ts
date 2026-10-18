import type { Guardian } from '../../../../domain/guardian';
import { GuardianEntity } from '../entities/guardian.entity';

/** Converts between the `Guardian` domain type and its TypeORM row. */
export class GuardianMapper {
  static toDomain(entity: GuardianEntity): Guardian {
    return {
      id: entity.id,
      institutionId: entity.institutionId,
      phone: entity.phone,
      name: entity.name,
      createdAt: entity.createdAt,
    };
  }
}
