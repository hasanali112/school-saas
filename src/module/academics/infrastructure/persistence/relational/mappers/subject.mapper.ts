import type { NewSubject, Subject } from '../../../../domain/subject';
import { SubjectEntity } from '../entities/subject.entity';

/** Converts between the `Subject` domain type and its TypeORM row. */
export class SubjectMapper {
  static toDomain(entity: SubjectEntity): Subject {
    return {
      id: entity.id,
      institutionId: entity.institutionId,
      code: entity.code,
      nameBn: entity.nameBn,
      nameEn: entity.nameEn,
      kind: entity.kind,
      religion: entity.religion,
      createdAt: entity.createdAt,
    };
  }

  static toPersistence(data: NewSubject): SubjectEntity {
    const entity = new SubjectEntity();
    entity.institutionId = data.institutionId;
    entity.code = data.code;
    entity.nameBn = data.nameBn;
    entity.nameEn = data.nameEn;
    entity.kind = data.kind;
    entity.religion = data.religion;
    return entity;
  }
}
