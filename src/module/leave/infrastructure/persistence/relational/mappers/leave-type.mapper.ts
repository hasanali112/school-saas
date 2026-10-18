import type { LeaveType, NewLeaveType } from '../../../../domain/leave';
import { LeaveTypeEntity } from '../entities/leave-type.entity';

/** Converts between the `LeaveType` domain type and its TypeORM row. */
export class LeaveTypeMapper {
  static toDomain(entity: LeaveTypeEntity): LeaveType {
    return {
      id: entity.id,
      institutionId: entity.institutionId,
      name: entity.name,
      appliesTo: entity.appliesTo,
      maxDaysPerYear: entity.maxDaysPerYear,
      createdAt: entity.createdAt,
    };
  }

  static toPersistence(data: NewLeaveType): LeaveTypeEntity {
    const entity = new LeaveTypeEntity();
    entity.institutionId = data.institutionId;
    entity.name = data.name;
    entity.appliesTo = data.appliesTo;
    entity.maxDaysPerYear = data.maxDaysPerYear;
    return entity;
  }
}
