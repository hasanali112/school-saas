import { Injectable } from '@nestjs/common';
import {
  FindOptionsWhere,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
} from 'typeorm';
import { DatabaseService } from '@common/services/database/database.service';
import { LeaveStatus } from '../../../../domain/leave';
import type {
  LeaveApplicant,
  LeaveApplication,
  LeaveDecision,
  LeaveFilter,
  LeaveType,
  NewLeaveApplication,
  NewLeaveType,
} from '../../../../domain/leave';
import { LeaveRepository } from '../../../../application/ports/leave.repository.port';
import { LeaveApplicationEntity } from '../entities/leave-application.entity';
import { LeaveTypeEntity } from '../entities/leave-type.entity';
import { LeaveApplicationMapper } from '../mappers/leave-application.mapper';
import { LeaveTypeMapper } from '../mappers/leave-type.mapper';

@Injectable()
export class LeaveRelationalRepository implements LeaveRepository {
  constructor(private readonly db: DatabaseService) {}

  async insertType(data: NewLeaveType): Promise<LeaveType> {
    const row = await this.db.tenant((m) =>
      m.save(LeaveTypeMapper.toPersistence(data)),
    );
    return LeaveTypeMapper.toDomain(row);
  }

  async findTypes(): Promise<LeaveType[]> {
    const rows = await this.db.tenant((m) =>
      m.find(LeaveTypeEntity, { order: { name: 'ASC' } }),
    );
    return rows.map((row) => LeaveTypeMapper.toDomain(row));
  }

  async findTypeById(id: string): Promise<LeaveType | undefined> {
    const row = await this.db.tenant((m) =>
      m.findOneBy(LeaveTypeEntity, { id }),
    );
    return row ? LeaveTypeMapper.toDomain(row) : undefined;
  }

  async insertApplication(
    data: NewLeaveApplication,
  ): Promise<LeaveApplication> {
    const row = await this.db.tenant((m) =>
      m.save(LeaveApplicationMapper.toPersistence(data)),
    );
    return LeaveApplicationMapper.toDomain(row);
  }

  async findApplications(filter: LeaveFilter): Promise<LeaveApplication[]> {
    const where: FindOptionsWhere<LeaveApplicationEntity> = {};
    if (filter.status) where.status = filter.status;
    if (filter.kind) where.applicantKind = filter.kind;
    const rows = await this.db.tenant((m) =>
      m.find(LeaveApplicationEntity, { where, order: { createdAt: 'DESC' } }),
    );
    return rows.map((row) => LeaveApplicationMapper.toDomain(row));
  }

  async findById(id: string): Promise<LeaveApplication | undefined> {
    const row = await this.db.tenant((m) =>
      m.findOneBy(LeaveApplicationEntity, { id }),
    );
    return row ? LeaveApplicationMapper.toDomain(row) : undefined;
  }

  async findApprovedInYear(
    applicant: LeaveApplicant,
    leaveTypeId: string,
    year: number,
  ): Promise<LeaveApplication[]> {
    const who: FindOptionsWhere<LeaveApplicationEntity> = applicant.userId
      ? { userId: applicant.userId }
      : { studentId: applicant.studentId ?? undefined };
    const rows = await this.db.tenant((m) =>
      m.findBy(LeaveApplicationEntity, {
        ...who,
        leaveTypeId,
        status: LeaveStatus.Approved,
        fromDate: MoreThanOrEqual(`${year}-01-01`),
        toDate: LessThanOrEqual(`${year}-12-31`),
      }),
    );
    return rows.map((row) => LeaveApplicationMapper.toDomain(row));
  }

  decide(
    id: string,
    status: LeaveDecision,
    decidedBy: string,
    note?: string,
  ): Promise<LeaveApplication | undefined> {
    return this.db.tenant(async (m) => {
      const { affected } = await m.update(
        LeaveApplicationEntity,
        { id, status: LeaveStatus.Pending },
        {
          status,
          decidedBy,
          decidedAt: new Date(),
          decisionNote: note ?? null,
        },
      );
      if (!affected) return undefined;
      const row = await m.findOneByOrFail(LeaveApplicationEntity, { id });
      return LeaveApplicationMapper.toDomain(row);
    });
  }

  async findStudentsOnApprovedLeave(
    studentIds: readonly string[],
    date: string,
  ): Promise<Set<string>> {
    if (studentIds.length === 0) return new Set();
    const rows = await this.db.tenant((m) =>
      m.find(LeaveApplicationEntity, {
        select: { studentId: true },
        where: {
          studentId: In([...studentIds]),
          status: LeaveStatus.Approved,
          fromDate: LessThanOrEqual(date),
          toDate: MoreThanOrEqual(date),
        },
      }),
    );
    return new Set(
      rows.map((r) => r.studentId).filter((id): id is string => !!id),
    );
  }
}
