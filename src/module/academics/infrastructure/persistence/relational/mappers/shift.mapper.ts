import type { NewShift, Shift } from '../../../../domain/shift';
import { ShiftEntity } from '../entities/shift.entity';

/** Converts between the `Shift` domain type and its TypeORM row. */
export class ShiftMapper {
  static toDomain(entity: ShiftEntity): Shift {
    return {
      id: entity.id,
      institutionId: entity.institutionId,
      name: entity.name,
      createdAt: entity.createdAt,
    };
  }

  static toPersistence(data: NewShift): ShiftEntity {
    const entity = new ShiftEntity();
    entity.institutionId = data.institutionId;
    entity.name = data.name;
    return entity;
  }
}
