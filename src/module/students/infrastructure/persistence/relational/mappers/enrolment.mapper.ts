import type { Enrolment, NewEnrolment } from '../../../../domain/enrolment';
import { EnrolmentEntity } from '../entities/enrolment.entity';

/** Converts between the `Enrolment` domain type and its TypeORM row. */
export class EnrolmentMapper {
  static toDomain(entity: EnrolmentEntity): Enrolment {
    return {
      id: entity.id,
      institutionId: entity.institutionId,
      studentId: entity.studentId,
      sessionId: entity.sessionId,
      sectionId: entity.sectionId,
      rollNo: entity.rollNo,
      fourthSubjectId: entity.fourthSubjectId,
      religionSubjectId: entity.religionSubjectId,
      createdAt: entity.createdAt,
    };
  }

  static toPersistence(data: NewEnrolment): EnrolmentEntity {
    const entity = new EnrolmentEntity();
    entity.institutionId = data.institutionId;
    entity.studentId = data.studentId;
    entity.sessionId = data.sessionId;
    entity.sectionId = data.sectionId;
    entity.rollNo = data.rollNo;
    entity.fourthSubjectId = data.fourthSubjectId;
    entity.religionSubjectId = data.religionSubjectId;
    return entity;
  }
}
