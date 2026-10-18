import type {
  NewStudentGuardian,
  StudentGuardian,
} from '../../../../domain/guardian';
import { StudentGuardianEntity } from '../entities/student-guardian.entity';

/** Converts between the `StudentGuardian` domain type and its TypeORM row. */
export class StudentGuardianMapper {
  static toDomain(entity: StudentGuardianEntity): StudentGuardian {
    return {
      id: entity.id,
      institutionId: entity.institutionId,
      studentId: entity.studentId,
      guardianId: entity.guardianId,
      relation: entity.relation,
      isPrimary: entity.isPrimary,
      createdAt: entity.createdAt,
    };
  }

  static toPersistence(data: NewStudentGuardian): StudentGuardianEntity {
    const entity = new StudentGuardianEntity();
    entity.institutionId = data.institutionId;
    entity.studentId = data.studentId;
    entity.guardianId = data.guardianId;
    entity.relation = data.relation;
    entity.isPrimary = data.isPrimary;
    return entity;
  }
}
