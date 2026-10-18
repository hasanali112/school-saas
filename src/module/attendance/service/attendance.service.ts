import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { HolidaysFacade } from '@module/academics/service/holidays.facade';
import { SessionsFacade } from '@module/academics/service/sessions.facade';
import { TeachersFacade } from '@module/academics/service/teachers.facade';
import { AuditLogPort } from '@module/audit/port/audit-log.port';
import type { AuthUser } from '@module/auth/domain/auth-user';
import { Role } from '@module/auth/domain/role';
import { EventPublisherPort } from '@module/events/port/event-publisher.port';
import { LeaveFacade } from '@module/leave/service/leave.facade';
import type { RosterEntry } from '@module/students/domain/enrolment';
import { EnrolmentsFacade } from '@module/students/service/enrolments.facade';
import { isMonth, monthBounds } from '@module/time/domain/local-date';
import { ClockPort } from '@module/time/port/clock.port';
import { UsersFacade } from '@module/users/service/users.facade';
import {
  AttendanceStatus,
  PRESENT_STATUSES,
  STIPEND_THRESHOLD_PERCENT,
} from '../domain/attendance';
import type {
  AttendanceRecord,
  DayStatuses,
  NewAttendanceRecord,
  StatusCounts,
} from '../domain/attendance';
import {
  AttendanceSheetDto,
  MarkResultDto,
  MonthlyRegisterDto,
  MonthlySummaryDto,
  MonthlySummaryRowDto,
  RegisterRowDto,
  SheetEntryDto,
  StaffAttendanceEntryResponseDto,
} from '../dto/attendance.response.dto';
import {
  MarkAttendanceDto,
  MarkStaffAttendanceDto,
} from '../dto/mark-attendance.dto';
import { AttendanceMarkedEvent } from '../events/attendance-marked.event';
import { AttendanceRepositoryPort } from '../port/attendance.repository.port';

const ADMIN_ROLES: ReadonlySet<Role> = new Set([
  Role.InstituteHead,
  Role.AdminOfficer,
]);

/** A section's roster and its records for one month. */
interface MonthData {
  roster: RosterEntry[];
  records: AttendanceRecord[];
}

@Injectable()
export class AttendanceService {
  constructor(
    private readonly repo: AttendanceRepositoryPort,
    private readonly sessions: SessionsFacade,
    private readonly holidays: HolidaysFacade,
    private readonly teachers: TeachersFacade,
    private readonly enrolments: EnrolmentsFacade,
    private readonly leave: LeaveFacade,
    private readonly users: UsersFacade,
    private readonly audit: AuditLogPort,
    private readonly events: EventPublisherPort,
    private readonly clock: ClockPort,
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
    const today = this.clock.today();
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
    const [isHoliday, roster] = await Promise.all([
      this.holidays.isHoliday(dto.date),
      this.assertSectionAccess(sectionId, sessionId, actor).then(() =>
        this.enrolments.rosterEntries(sectionId, sessionId),
      ),
    ]);
    if (isHoliday) throw new BadRequestException(`${dto.date} is a holiday`);

    const byEnrolment = new Map(roster.map((r) => [r.enrolmentId, r]));
    const unknown = dto.entries.filter((e) => !byEnrolment.has(e.enrolmentId));
    if (unknown.length)
      throw new BadRequestException(
        `${unknown.length} entries do not belong to this section`,
      );

    const onLeave = await this.leave.studentsOnApprovedLeave(
      roster.map((r) => r.studentId),
      dto.date,
    );
    const rows: NewAttendanceRecord[] = dto.entries.map((entry) => {
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
          ? AttendanceStatus.Leave
          : entry.status,
        markedBy: actor.id,
      };
    });

    const before = isBackdated
      ? await this.repo.findRecords(
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
        written
          .filter((r) => r.status === AttendanceStatus.Absent)
          .map((r) => r.studentId),
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
  ): Promise<AttendanceSheetDto> {
    const resolved = await this.sessions.resolveId(sessionId);
    await this.assertSectionAccess(sectionId, resolved, actor);
    const [roster, isHoliday] = await Promise.all([
      this.enrolments.rosterEntries(sectionId, resolved),
      this.holidays.isHoliday(date),
    ]);
    const records = await this.repo.findRecords(
      roster.map((r) => r.enrolmentId),
      date,
      period,
    );
    const statusByEnrolment = new Map(
      records.map((r) => [r.enrolmentId, r.status]),
    );
    return new AttendanceSheetDto(
      sectionId,
      resolved,
      date,
      period,
      isHoliday,
      roster.map(
        (r) =>
          new SheetEntryDto(
            r.enrolmentId,
            r.studentId,
            r.rollNo,
            r.nameBn,
            r.nameEn,
            statusByEnrolment.get(r.enrolmentId) ?? null,
          ),
      ),
    );
  }

  async register(
    sectionId: string,
    month: string,
    actor: AuthUser,
    sessionId?: string,
  ): Promise<MonthlyRegisterDto> {
    const { roster, records } = await this.loadMonth(
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
    if (dto.date > this.clock.today())
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

  /** Every active staff member with their status for the date (null = not marked). */
  async staffSheet(date: string): Promise<StaffAttendanceEntryResponseDto[]> {
    const [staff, marks] = await Promise.all([
      this.users.listActiveStaff(),
      this.repo.findStaffMarks(date),
    ]);
    const statusByUser = new Map(marks.map((m) => [m.userId, m.status]));
    return staff.map(
      (s) =>
        new StaffAttendanceEntryResponseDto(
          s.userId,
          s.name,
          statusByUser.get(s.userId) ?? null,
        ),
    );
  }

  private async loadMonth(
    sectionId: string,
    month: string,
    actor: AuthUser,
    sessionId?: string,
  ): Promise<MonthData> {
    if (!isMonth(month)) throw new BadRequestException('month must be YYYY-MM');
    const resolved = await this.sessions.resolveId(sessionId);
    await this.assertSectionAccess(sectionId, resolved, actor);
    const { from, to } = monthBounds(month);
    const [roster, records] = await Promise.all([
      this.enrolments.rosterEntries(sectionId, resolved),
      this.repo.findMonth(sectionId, resolved, from, to),
    ]);
    return { roster, records };
  }

  private async assertSectionAccess(
    sectionId: string,
    sessionId: string,
    actor: AuthUser,
  ): Promise<void> {
    if (this.isAdmin(actor)) return;
    const assigned = await this.teachers.assignedSectionIds(
      actor.id,
      sessionId,
    );
    if (!assigned.has(sectionId))
      throw new ForbiddenException('You are not assigned to this section');
  }

  private auditBackdate(
    before: readonly AttendanceRecord[],
    after: readonly AttendanceRecord[],
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

  private countByStatus(rows: readonly AttendanceRecord[]): StatusCounts {
    const counts: StatusCounts = { present: 0, absent: 0, late: 0, leave: 0 };
    for (const row of rows) counts[row.status] += 1;
    return counts;
  }

  /** enrolmentId → { date → status }, in one pass. Per-period records collapse to "present if any period present". */
  private groupDays(
    records: readonly AttendanceRecord[],
  ): Map<string, DayStatuses> {
    const map = new Map<string, DayStatuses>();
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

  private countPresent(days: DayStatuses): number {
    let n = 0;
    for (const status of Object.values(days))
      if (PRESENT_STATUSES.has(status)) n += 1;
    return n;
  }
}
