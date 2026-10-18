import type {
  NewSectionClassTeacher,
  SectionClassTeacher,
} from '../../../../domain/teacher-assignment';
import { SectionClassTeacherEntity } from '../entities/section-class-teacher.entity';

/** Converts between the `SectionClassTeacher` domain type and its TypeORM row. */
export class SectionClassTeacherMapper {
  static toDomain(entity: SectionClassTeacherEntity): SectionClassTeacher {
    return {
      id: entity.id,
      institutionId: entity.institutionId,
      sessionId: entity.sessionId,
      sectionId: entity.sectionId,
      teacherUserId: entity.teacherUserId,
      createdAt: entity.createdAt,
    };
  }

  static toPersistence(
    data: NewSectionClassTeacher,
  ): SectionClassTeacherEntity {
    const entity = new SectionClassTeacherEntity();
    entity.institutionId = data.institutionId;
    entity.sessionId = data.sessionId;
    entity.sectionId = data.sectionId;
    entity.teacherUserId = data.teacherUserId;
    return entity;
  }
}
