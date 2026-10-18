import type { ClassSubject, NewClassSubject } from '../../../../domain/subject';
import { ClassSubjectEntity } from '../entities/class-subject.entity';

/** Converts between the `ClassSubject` domain type and its TypeORM row. */
export class ClassSubjectMapper {
  static toDomain(entity: ClassSubjectEntity): ClassSubject {
    return {
      id: entity.id,
      institutionId: entity.institutionId,
      classId: entity.classId,
      subjectId: entity.subjectId,
      role: entity.role,
      createdAt: entity.createdAt,
    };
  }

  static toPersistence(data: NewClassSubject): ClassSubjectEntity {
    const entity = new ClassSubjectEntity();
    entity.institutionId = data.institutionId;
    entity.classId = data.classId;
    entity.subjectId = data.subjectId;
    entity.role = data.role;
    return entity;
  }
}
