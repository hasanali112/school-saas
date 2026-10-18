import type {
  AcademicSession,
  NewAcademicSession,
} from '../../../../domain/academic-session';
import { AcademicSessionEntity } from '../entities/academic-session.entity';

/** Converts between the `AcademicSession` domain type and its TypeORM row. */
export class AcademicSessionMapper {
  static toDomain(entity: AcademicSessionEntity): AcademicSession {
    return {
      id: entity.id,
      institutionId: entity.institutionId,
      name: entity.name,
      startsOn: entity.startsOn,
      endsOn: entity.endsOn,
      isCurrent: entity.isCurrent,
      createdAt: entity.createdAt,
    };
  }

  static toPersistence(data: NewAcademicSession): AcademicSessionEntity {
    const entity = new AcademicSessionEntity();
    entity.institutionId = data.institutionId;
    entity.name = data.name;
    entity.startsOn = data.startsOn;
    entity.endsOn = data.endsOn;
    entity.isCurrent = data.isCurrent;
    return entity;
  }
}
