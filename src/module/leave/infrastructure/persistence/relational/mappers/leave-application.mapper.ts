import type {
  LeaveApplication,
  NewLeaveApplication,
} from '../../../../domain/leave';
import { LeaveApplicationEntity } from '../entities/leave-application.entity';

/** Converts between the `LeaveApplication` domain type and its TypeORM row. */
export class LeaveApplicationMapper {
  static toDomain(entity: LeaveApplicationEntity): LeaveApplication {
    return {
      id: entity.id,
      institutionId: entity.institutionId,
      leaveTypeId: entity.leaveTypeId,
      applicantKind: entity.applicantKind,
      userId: entity.userId,
      studentId: entity.studentId,
      fromDate: entity.fromDate,
      toDate: entity.toDate,
      reason: entity.reason,
      status: entity.status,
      appliedBy: entity.appliedBy,
      decidedBy: entity.decidedBy,
      decidedAt: entity.decidedAt,
      decisionNote: entity.decisionNote,
      createdAt: entity.createdAt,
    };
  }

  static toPersistence(data: NewLeaveApplication): LeaveApplicationEntity {
    const entity = new LeaveApplicationEntity();
    entity.institutionId = data.institutionId;
    entity.leaveTypeId = data.leaveTypeId;
    entity.applicantKind = data.applicantKind;
    entity.userId = data.userId;
    entity.studentId = data.studentId;
    entity.fromDate = data.fromDate;
    entity.toDate = data.toDate;
    entity.reason = data.reason;
    entity.appliedBy = data.appliedBy;
    return entity;
  }
}
