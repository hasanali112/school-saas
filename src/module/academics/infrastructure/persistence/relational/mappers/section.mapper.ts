import type { NewSection, Section } from '../../../../domain/school-class';
import { SectionEntity } from '../entities/section.entity';

/** Converts between the `Section` domain type and its TypeORM row. */
export class SectionMapper {
  static toDomain(entity: SectionEntity): Section {
    return {
      id: entity.id,
      institutionId: entity.institutionId,
      classId: entity.classId,
      shiftId: entity.shiftId,
      name: entity.name,
      createdAt: entity.createdAt,
    };
  }

  static toPersistence(data: NewSection): SectionEntity {
    const entity = new SectionEntity();
    entity.institutionId = data.institutionId;
    entity.classId = data.classId;
    entity.shiftId = data.shiftId;
    entity.name = data.name;
    return entity;
  }
}
