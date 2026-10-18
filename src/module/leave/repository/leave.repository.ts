import { Injectable } from '@nestjs/common';
import {
  FindOptionsWhere,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
} from 'typeorm';
import { DatabaseService } from '@common/services/database/database.service';
import { LeaveStatus } from '../domain/leave';
import type {
  LeaveApplicant,
  LeaveApplication,
  LeaveDecision,
  LeaveFilter,
  LeaveType,
  NewLeaveApplication,
  NewLeaveType,
} from '../domain/leave';
import { LeaveRepositoryPort } from '../port/leave.repository.port';
import { LeaveApplicationEntity } from './entities/leave-application.entity';
import { LeaveTypeEntity } from './entities/leave-type.entity';

@Injectable()
export class LeaveRepository implements LeaveRepositoryPort {
  constructor(private readonly db: DatabaseService) {}

  insertType(data: NewLeaveType): Promise<LeaveType> {
    return this.db.tenant((m) => m.save(m.create(LeaveTypeEntity, data)));
  }

  findTypes(): Promise<LeaveType[]> {
    return this.db.tenant((m) =>
      m.find(LeaveTypeEntity, { order: { name: 'ASC' } }),
    );
  }

  async findTypeById(id: string): Promise<LeaveType | undefined> {
    return (
      (await this.db.tenant((m) => m.findOneBy(LeaveTypeEntity, { id }))) ??
      undefined
    );
  }

  insertApplication(data: NewLeaveApplication): Promise<LeaveApplication> {
    return this.db.tenant((m) =>
      m.save(m.create(LeaveApplicationEntity, data)),
    );
  }

  findApplications(filter: LeaveFilter): Promise<LeaveApplication[]> {
    const where: FindOptionsWhere<LeaveApplicationEntity> = {};
    if (filter.status) where.status = filter.status;
    if (filter.kind) where.applicantKind = filter.kind;
    return this.db.tenant((m) =>
      m.find(LeaveApplicationEntity, { where, order: { createdAt: 'DESC' } }),
    );
  }

  async findById(id: string): Promise<LeaveApplication | undefined> {
    return (
      (await this.db.tenant((m) =>
        m.findOneBy(LeaveApplicationEntity, { id }),
      )) ?? undefined
    );
  }

  findApprovedInYear(
    applicant: LeaveApplicant,
    leaveTypeId: string,
    year: number,
  ): Promise<LeaveApplication[]> {
    const who: FindOptionsWhere<LeaveApplicationEntity> = applicant.userId
      ? { userId: applicant.userId }
      : { studentId: applicant.studentId ?? undefined };
    return this.db.tenant((m) =>
      m.findBy(LeaveApplicationEntity, {
        ...who,
        leaveTypeId,
        status: LeaveStatus.Approved,
        fromDate: MoreThanOrEqual(`${year}-01-01`),
        toDate: LessThanOrEqual(`${year}-12-31`),
      }),
    );
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
      return (await m.findOneBy(LeaveApplicationEntity, { id })) ?? undefined;
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
