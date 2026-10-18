import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { todayLocal, monthBounds } from '@shared/time/local-date';
import { AuthUser } from '@modules/auth/auth-user';
import { Role } from '@modules/auth/roles';
import { AttendanceRecordRow } from '@database/schema';
import { HolidaysService } from '@modules/academics/holidays/holidays.service';
import { SessionsService } from '@modules/academics/sessions/sessions.service';
import { AuditService } from '@shared/audit/audit.service';
import { DomainEvents } from '@shared/events/domain-events.service';
import { AttendanceRepository, RosterStatusRow } from './attendance.repository';
import {
  AttendanceSheetDto,
  AttendanceStatusValue,
  MarkResultDto,
  MonthlyRegisterDto,
  MonthlySummaryDto,
  MonthlySummaryRowDto,
  RegisterRowDto,
  SheetEntryDto,
  StaffAttendanceEntryResponseDto,
} from './dto/attendance.response.dto';
import {
  MarkAttendanceDto,
  MarkStaffAttendanceDto,
} from './dto/mark-attendance.dto';
import { AttendanceMarkedEvent } from './events/attendance-marked.event';

/** Government stipend requires this attendance percentage (F1-05). */
export const STIPEND_THRESHOLD_PERCENT = 75;
const PRESENT_STATUSES: ReadonlySet<AttendanceStatusValue> = new Set([
  'present',
  'late',
]);
const ADMIN_ROLES: ReadonlySet<Role> = new Set([
  Role.InstituteHead,
  Role.AdminOfficer,
]);
const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

@Injectable()
export class AttendanceService {
  constructor(
    private readonly repo: AttendanceRepository,
    private readonly sessions: SessionsService,
    private readonly holidays: HolidaysService,
    private readonly audit: AuditService,
    private readonly events: DomainEvents,
  ) {}

  /**
   * Rules (F1-05): assigned sections only for teachers; same-day marking for everyone;
   * backdating is admin-only, needs a reason and is audited per changed record; no
   * future dates; no holidays; approved leave wins over whatever the teacher marked.
   */
  async mark(
    sectionId: string,
    dto: MarkAttendanceDto,
    actor: AuthUser,
  ): Promise<MarkResultDto> {
    const today = todayLocal();
    if (dto.date > today)
      throw new BadRequestException(
        'Attendance cannot be marked for a future date',
      );
    const isBackdated = dto.date < today;
    if (isBackdated && !this.isAdmin(actor))
      throw new ForbiddenException('Only the office can mark past dates');
    if (isBackdated && !dto.reason)
      throw new BadRequestException(
        'reason is required when marking a past date',
      );

    const sessionId = await this.sessions.resolveId(dto.sessionId);
    const [isHoliday, roster, onLeave] = await Promise.all([
      this.holidays.isHoliday(dto.date),
      this.assertSectionAccess(sectionId, sessionId, actor).then(() =>
        this.repo.findSheet(sectionId, sessionId, dto.date, dto.period),
      ),
      this.repo.findStudentsOnApprovedLeave(sectionId, sessionId, dto.date),
    ]);
    if (isHoliday) throw new BadRequestException(`${dto.date} is a holiday`);

    const byEnrolment = new Map(roster.map((r) => [r.enrolmentId, r]));
    const unknown = dto.entries.filter((e) => !byEnrolment.has(e.enrolmentId));
    if (unknown.length)
      throw new BadRequestException(
        `${unknown.length} entries do not belong to this section`,
      );

    const rows = dto.entries.map((entry) => {
      const student = byEnrolment.get(entry.enrolmentId)!;
      return {
        institutionId: actor.institutionId,
        sessionId,
        sectionId,
        enrolmentId: entry.enrolmentId,
        studentId: student.studentId,
        date: dto.date,
        period: dto.period,
        status: onLeave.has(student.studentId)
          ? ('leave' as const)
          : entry.status,
        markedBy: actor.id,
      };
    });

    const before = isBackdated
      ? await this.repo.findExisting(
          rows.map((r) => r.enrolmentId),
          dto.date,
          dto.period,
        )
      : [];
    const written = await this.repo.upsertMany(rows, actor.id);

    if (isBackdated)
      await this.auditBackdate(before, written, dto.reason!, actor);
    this.events.publish(
      new AttendanceMarkedEvent(
        actor.institutionId,
        sectionId,
        dto.date,
        dto.period,
        written.filter((r) => r.status === 'absent').map((r) => r.studentId),
        actor.id,
      ),
    );
    return new MarkResultDto(
      dto.date,
      dto.period,
      written.length,
      this.countByStatus(written),
      isBackdated,
    );
  }

  async sheet(
    sectionId: string,
    date: string,
    period: number,
    actor: AuthUser,
    sessionId?: string,
  ) {
    const resolved = await this.sessions.resolveId(sessionId);
    await this.assertSectionAccess(sectionId, resolved, actor);
    const [rows, isHoliday] = await Promise.all([
      this.repo.findSheet(sectionId, resolved, date, period),
      this.holidays.isHoliday(date),
    ]);
    return new AttendanceSheetDto(
      sectionId,
      resolved,
      date,
      period,
      isHoliday,
      rows.map((row) => this.toSheetEntry(row)),
    );
  }

  async register(
    sectionId: string,
    month: string,
    actor: AuthUser,
    sessionId?: string,
  ): Promise<MonthlyRegisterDto> {
    const { resolved, roster, records } = await this.loadMonth(
      sectionId,
      month,
      actor,
      sessionId,
    );
    const workingDays = [...new Set(records.map((r) => r.date))].sort();
    const daysByEnrolment = this.groupDays(records);
    const rows = roster.map((r) => {
      const days = daysByEnrolment.get(r.enrolmentId) ?? {};
      return new RegisterRowDto(
        r.enrolmentId,
        r.rollNo,
        r.nameBn,
        r.nameEn,
        days,
        this.countPresent(days),
      );
    });
    void resolved;
    return new MonthlyRegisterDto(sectionId, month, workingDays, rows);
  }

  async summary(
    sectionId: string,
    month: string,
    actor: AuthUser,
    sessionId?: string,
  ): Promise<MonthlySummaryDto> {
    const { roster, records } = await this.loadMonth(
      sectionId,
      month,
      actor,
      sessionId,
    );
    const workingDays = new Set(records.map((r) => r.date)).size;
    const daysByEnrolment = this.groupDays(records);
    const rows = roster.map((r) => {
      const presentDays = this.countPresent(
        daysByEnrolment.get(r.enrolmentId) ?? {},
      );
      const percentage =
        workingDays === 0
          ? 0
          : Math.round((presentDays / workingDays) * 1000) / 10;
      return new MonthlySummaryRowDto(
        r.studentId,
        r.rollNo,
        r.nameBn,
        r.nameEn,
        presentDays,
        workingDays,
        percentage,
        workingDays > 0 && percentage >= STIPEND_THRESHOLD_PERCENT,
      );
    });
    return new MonthlySummaryDto(
      sectionId,
      month,
      workingDays,
      STIPEND_THRESHOLD_PERCENT,
      rows,
    );
  }

  async markStaff(
    dto: MarkStaffAttendanceDto,
    actor: AuthUser,
  ): Promise<number> {
    if (dto.date > todayLocal())
      throw new BadRequestException(
        'Attendance cannot be marked for a future date',
      );
    return this.repo.upsertStaffMany(
      dto.entries.map((e) => ({
        institutionId: actor.institutionId,
        userId: e.userId,
        date: dto.date,
        status: e.status,
        markedBy: actor.id,
      })),
    );
  }

  async staffSheet(date: string): Promise<StaffAttendanceEntryResponseDto[]> {
    const rows = await this.repo.findStaffSheet(date);
    return rows.map(
      (r) => new StaffAttendanceEntryResponseDto(r.userId, r.name, r.status),
    );
  }

  private async loadMonth(
    sectionId: string,
    month: string,
    actor: AuthUser,
    sessionId?: string,
  ) {
    if (!MONTH_PATTERN.test(month))
      throw new BadRequestException('month must be YYYY-MM');
    const resolved = await this.sessions.resolveId(sessionId);
    await this.assertSectionAccess(sectionId, resolved, actor);
    const { from, to } = monthBounds(month);
    const [roster, records] = await Promise.all([
      this.repo.findSheet(sectionId, resolved, from, 0),
      this.repo.findMonth(sectionId, resolved, from, to),
    ]);
    return { resolved, roster, records };
  }

  private async assertSectionAccess(
    sectionId: string,
    sessionId: string,
    actor: AuthUser,
  ): Promise<void> {
    if (this.isAdmin(actor)) return;
    const assigned = await this.repo.findAssignedSectionIds(
      actor.id,
      sessionId,
    );
    if (!assigned.has(sectionId))
      throw new ForbiddenException('You are not assigned to this section');
  }

  private auditBackdate(
    before: readonly AttendanceRecordRow[],
    after: readonly AttendanceRecordRow[],
    reason: string,
    actor: AuthUser,
  ): Promise<void> {
    const previous = new Map(before.map((r) => [r.enrolmentId, r.status]));
    const changed = after.filter(
      (r) => previous.get(r.enrolmentId) !== r.status,
    );
    return this.audit.record(
      changed.map((r) => ({
        actorId: actor.id,
        action: 'attendance.backdated',
        entity: 'attendance_record',
        entityId: r.id,
        before: { status: previous.get(r.enrolmentId) ?? null },
        after: { status: r.status, date: r.date, period: r.period },
        reason,
      })),
    );
  }

  private isAdmin(actor: AuthUser): boolean {
    return actor.roles.some((role) => ADMIN_ROLES.has(role));
  }

  private toSheetEntry(r: RosterStatusRow): SheetEntryDto {
    return new SheetEntryDto(
      r.enrolmentId,
      r.studentId,
      r.rollNo,
      r.nameBn,
      r.nameEn,
      r.status,
    );
  }

  private countByStatus(
    rows: readonly AttendanceRecordRow[],
  ): Record<AttendanceStatusValue, number> {
    const counts: Record<AttendanceStatusValue, number> = {
      present: 0,
      absent: 0,
      late: 0,
      leave: 0,
    };
    for (const row of rows) counts[row.status] += 1;
    return counts;
  }

  /** enrolmentId → { date → status }, in one pass. Per-period records collapse to "present if any period present". */
  private groupDays(
    records: readonly AttendanceRecordRow[],
  ): Map<string, Record<string, AttendanceStatusValue>> {
    const map = new Map<string, Record<string, AttendanceStatusValue>>();
    for (const r of records) {
      let days = map.get(r.enrolmentId);
      if (!days) {
        days = {};
        map.set(r.enrolmentId, days);
      }
      const existing = days[r.date];
      if (
        !existing ||
        (!PRESENT_STATUSES.has(existing) && PRESENT_STATUSES.has(r.status))
      )
        days[r.date] = r.status;
    }
    return map;
  }

  private countPresent(days: Record<string, AttendanceStatusValue>): number {
    let n = 0;
    for (const status of Object.values(days))
      if (PRESENT_STATUSES.has(status)) n += 1;
    return n;
  }
}
