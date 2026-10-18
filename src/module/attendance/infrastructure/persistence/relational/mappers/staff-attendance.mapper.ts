import type {
  NewStaffAttendance,
  StaffMark,
} from '../../../../domain/attendance';
import { StaffAttendanceEntity } from '../entities/staff-attendance.entity';

/** Converts between staff-attendance domain types and their TypeORM row. */
export class StaffAttendanceMapper {
  static toStaffMark(entity: StaffAttendanceEntity): StaffMark {
    return { userId: entity.userId, status: entity.status };
  }

  static toPersistence(data: NewStaffAttendance): StaffAttendanceEntity {
    const entity = new StaffAttendanceEntity();
    entity.institutionId = data.institutionId;
    entity.userId = data.userId;
    entity.date = data.date;
    entity.status = data.status;
    entity.markedBy = data.markedBy;
    return entity;
  }
}
