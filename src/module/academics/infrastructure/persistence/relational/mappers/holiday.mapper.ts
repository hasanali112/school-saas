import type { Holiday, NewHoliday } from '../../../../domain/holiday';
import { HolidayEntity } from '../entities/holiday.entity';

/** Converts between the `Holiday` domain type and its TypeORM row. */
export class HolidayMapper {
  static toDomain(entity: HolidayEntity): Holiday {
    return {
      id: entity.id,
      institutionId: entity.institutionId,
      date: entity.date,
      nameBn: entity.nameBn,
      nameEn: entity.nameEn,
      kind: entity.kind,
      createdAt: entity.createdAt,
    };
  }

  static toPersistence(data: NewHoliday): HolidayEntity {
    const entity = new HolidayEntity();
    entity.institutionId = data.institutionId;
    entity.date = data.date;
    entity.nameBn = data.nameBn;
    entity.nameEn = data.nameEn;
    entity.kind = data.kind;
    return entity;
  }
}
