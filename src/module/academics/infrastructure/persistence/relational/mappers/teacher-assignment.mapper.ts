import type {
  NewTeacherAssignment,
  TeacherAssignment,
} from '../../../../domain/teacher-assignment';
import { TeacherAssignmentEntity } from '../entities/teacher-assignment.entity';

/** Converts between the `TeacherAssignment` domain type and its TypeORM row. */
export class TeacherAssignmentMapper {
  static toDomain(entity: TeacherAssignmentEntity): TeacherAssignment {
    return {
      id: entity.id,
      institutionId: entity.institutionId,
      sessionId: entity.sessionId,
      sectionId: entity.sectionId,
      subjectId: entity.subjectId,
      teacherUserId: entity.teacherUserId,
      createdAt: entity.createdAt,
    };
  }

  static toPersistence(data: NewTeacherAssignment): TeacherAssignmentEntity {
    const entity = new TeacherAssignmentEntity();
    entity.institutionId = data.institutionId;
    entity.sessionId = data.sessionId;
    entity.sectionId = data.sectionId;
    entity.subjectId = data.subjectId;
    entity.teacherUserId = data.teacherUserId;
    return entity;
  }
}
