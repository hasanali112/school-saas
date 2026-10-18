import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthUser } from '@modules/auth/auth-user';
import { Role } from '@modules/auth/roles';
import {
  isForeignKeyViolation,
  isUniqueViolation,
} from '@database/database.errors';
import { LeaveApplicationRow, LeaveTypeRow } from '@database/schema';
import { AuditService } from '@shared/audit/audit.service';
import { DomainEvents } from '@shared/events/domain-events.service';
import {
  ApplyLeaveDto,
  CreateLeaveTypeDto,
  DecideLeaveDto,
  ListLeaveQueryDto,
} from './dto/leave.dto';
import {
  inclusiveDays,
  LeaveApplicationResponseDto,
  LeaveTypeResponseDto,
} from './dto/leave.response.dto';
import { LeaveApprovedEvent } from './events/leave-approved.event';
import { LeaveRepository } from './leave.repository';

const MAX_LEAVE_SPAN_DAYS = 90;
const APPROVER_ROLES: ReadonlySet<Role> = new Set([
  Role.InstituteHead,
  Role.AdminOfficer,
]);

@Injectable()
export class LeaveService {
  constructor(
    private readonly repo: LeaveRepository,
    private readonly audit: AuditService,
    private readonly events: DomainEvents,
  ) {}

  async createType(
    dto: CreateLeaveTypeDto,
    actor: AuthUser,
  ): Promise<LeaveTypeResponseDto> {
    try {
      const row = await this.repo.insertType({
        ...dto,
        institutionId: actor.institutionId,
      });
      return LeaveTypeResponseDto.from(row);
    } catch (error) {
      if (isUniqueViolation(error))
        throw new ConflictException(`Leave type ${dto.name} already exists`);
      throw error;
    }
  }

  async listTypes(): Promise<LeaveTypeResponseDto[]> {
    return LeaveTypeResponseDto.fromMany(await this.repo.findTypes());
  }

  async apply(
    dto: ApplyLeaveDto,
    actor: AuthUser,
  ): Promise<LeaveApplicationResponseDto> {
    if (dto.fromDate > dto.toDate)
      throw new BadRequestException('fromDate must not be after toDate');
    if (inclusiveDays(dto.fromDate, dto.toDate) > MAX_LEAVE_SPAN_DAYS) {
      throw new BadRequestException(
        `A single application covers at most ${MAX_LEAVE_SPAN_DAYS} days`,
      );
    }
    const type = await this.repo.findTypeById(dto.leaveTypeId);
    if (!type) throw new NotFoundException('Leave type not found');

    const kind = dto.studentId ? 'student' : 'staff';
    if (type.appliesTo !== 'both' && type.appliesTo !== kind) {
      throw new BadRequestException(
        `Leave type ${type.name} does not apply to ${kind}`,
      );
    }

    try {
      const row = await this.repo.insertApplication({
        institutionId: actor.institutionId,
        leaveTypeId: type.id,
        applicantKind: kind,
        userId: kind === 'staff' ? actor.id : null,
        studentId: dto.studentId ?? null,
        fromDate: dto.fromDate,
        toDate: dto.toDate,
        reason: dto.reason,
        appliedBy: actor.id,
      });
      return LeaveApplicationResponseDto.from(row);
    } catch (error) {
      if (isForeignKeyViolation(error))
        throw new BadRequestException('Unknown student');
      throw error;
    }
  }

  async list(
    query: ListLeaveQueryDto,
    actor: AuthUser,
  ): Promise<LeaveApplicationResponseDto[]> {
    const rows = await this.repo.findApplications({
      status: query.status,
      kind: query.kind,
    });
    // Non-approvers only see what they applied for themselves or on behalf of a student.
    const visible = this.isApprover(actor)
      ? rows
      : rows.filter((r) => r.appliedBy === actor.id || r.userId === actor.id);
    return LeaveApplicationResponseDto.fromMany(visible);
  }

  async approve(
    id: string,
    dto: DecideLeaveDto,
    actor: AuthUser,
  ): Promise<LeaveApplicationResponseDto> {
    const pending = await this.requirePending(id);
    const type = await this.repo.findTypeById(pending.leaveTypeId);
    if (type) await this.assertWithinCap(pending, type);

    const row = await this.repo.decide(id, 'approved', actor.id, dto.note);
    if (!row) throw new ConflictException('Application is no longer pending');

    await this.audit.record({
      actorId: actor.id,
      action: 'leave.approved',
      entity: 'leave_application',
      entityId: row.id,
      before: { status: 'pending' },
      after: { status: 'approved', fromDate: row.fromDate, toDate: row.toDate },
      reason: dto.note,
    });
    this.events.publish(
      new LeaveApprovedEvent(
        actor.institutionId,
        row.id,
        row.applicantKind,
        (row.userId ?? row.studentId)!,
        row.fromDate,
        row.toDate,
        actor.id,
      ),
    );
    return LeaveApplicationResponseDto.from(row);
  }

  async reject(
    id: string,
    dto: DecideLeaveDto,
    actor: AuthUser,
  ): Promise<LeaveApplicationResponseDto> {
    await this.requirePending(id);
    const row = await this.repo.decide(id, 'rejected', actor.id, dto.note);
    if (!row) throw new ConflictException('Application is no longer pending');
    await this.audit.record({
      actorId: actor.id,
      action: 'leave.rejected',
      entity: 'leave_application',
      entityId: row.id,
      before: { status: 'pending' },
      after: { status: 'rejected' },
      reason: dto.note,
    });
    return LeaveApplicationResponseDto.from(row);
  }

  /** The applicant withdraws their own pending application. */
  async cancel(
    id: string,
    actor: AuthUser,
  ): Promise<LeaveApplicationResponseDto> {
    const pending = await this.requirePending(id);
    if (pending.appliedBy !== actor.id && !this.isApprover(actor)) {
      throw new ForbiddenException(
        'Only the applicant can cancel this application',
      );
    }
    const row = await this.repo.decide(id, 'cancelled', actor.id);
    if (!row) throw new ConflictException('Application is no longer pending');
    return LeaveApplicationResponseDto.from(row);
  }

  private async requirePending(id: string): Promise<LeaveApplicationRow> {
    const row = await this.repo.findById(id);
    if (!row) throw new NotFoundException(`Leave application ${id} not found`);
    if (row.status !== 'pending')
      throw new ConflictException(`Application is already ${row.status}`);
    return row;
  }

  private async assertWithinCap(
    application: LeaveApplicationRow,
    type: LeaveTypeRow,
  ): Promise<void> {
    if (type.maxDaysPerYear == null) return;
    const year = Number(application.fromDate.slice(0, 4));
    const approved = await this.repo.findApprovedInYear(
      application,
      type.id,
      year,
    );
    const used = approved.reduce(
      (sum, r) => sum + inclusiveDays(r.fromDate, r.toDate),
      0,
    );
    const requested = inclusiveDays(application.fromDate, application.toDate);
    if (used + requested > type.maxDaysPerYear) {
      throw new BadRequestException(
        `Approving would exceed ${type.maxDaysPerYear} days of ${type.name} in ${year} (${used} used)`,
      );
    }
  }

  private isApprover(actor: AuthUser): boolean {
    return actor.roles.some((role) => APPROVER_ROLES.has(role));
  }
}
