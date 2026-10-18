import type {
  AttendanceRecord,
  NewAttendanceRecord,
} from '../../../../domain/attendance';
import { AttendanceRecordEntity } from '../entities/attendance-record.entity';

/** Converts between the `AttendanceRecord` domain type and its TypeORM row. */
export class AttendanceRecordMapper {
  static toDomain(entity: AttendanceRecordEntity): AttendanceRecord {
    return {
      id: entity.id,
      institutionId: entity.institutionId,
      sessionId: entity.sessionId,
      sectionId: entity.sectionId,
      enrolmentId: entity.enrolmentId,
      studentId: entity.studentId,
      date: entity.date,
      period: entity.period,
      status: entity.status,
      markedBy: entity.markedBy,
      markedAt: entity.markedAt,
      updatedBy: entity.updatedBy,
      updatedAt: entity.updatedAt,
    };
  }

  static toPersistence(data: NewAttendanceRecord): AttendanceRecordEntity {
    const entity = new AttendanceRecordEntity();
    entity.institutionId = data.institutionId;
    entity.sessionId = data.sessionId;
    entity.sectionId = data.sectionId;
    entity.enrolmentId = data.enrolmentId;
    entity.studentId = data.studentId;
    entity.date = data.date;
    entity.period = data.period;
    entity.status = data.status;
    entity.markedBy = data.markedBy;
    return entity;
  }
}
