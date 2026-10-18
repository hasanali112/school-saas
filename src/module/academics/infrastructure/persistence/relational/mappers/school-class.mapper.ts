import type {
  NewSchoolClass,
  SchoolClass,
} from '../../../../domain/school-class';
import { SchoolClassEntity } from '../entities/school-class.entity';

/** Converts between the `SchoolClass` domain type and its TypeORM row. */
export class SchoolClassMapper {
  static toDomain(entity: SchoolClassEntity): SchoolClass {
    return {
      id: entity.id,
      institutionId: entity.institutionId,
      name: entity.name,
      ordinal: entity.ordinal,
      createdAt: entity.createdAt,
    };
  }

  static toPersistence(data: NewSchoolClass): SchoolClassEntity {
    const entity = new SchoolClassEntity();
    entity.institutionId = data.institutionId;
    entity.name = data.name;
    entity.ordinal = data.ordinal;
    return entity;
  }
}
