import type { Institution } from '../../../../domain/institution';
import { InstitutionEntity } from '../entities/institution.entity';

/** Converts between the `Institution` domain type and its TypeORM row. */
export class InstitutionMapper {
  static toDomain(entity: InstitutionEntity): Institution {
    return {
      id: entity.id,
      slug: entity.slug,
      nameBn: entity.nameBn,
      nameEn: entity.nameEn,
      eiin: entity.eiin,
      addressBn: entity.addressBn,
      addressEn: entity.addressEn,
      phone: entity.phone,
      createdAt: entity.createdAt,
    };
  }
}
