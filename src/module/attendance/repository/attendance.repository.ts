import { Injectable } from '@nestjs/common';
import { Between, In } from 'typeorm';
import { DatabaseService } from '@common/services/database/database.service';
import type {
  AttendanceRecord,
  NewAttendanceRecord,
  NewStaffAttendance,
  StaffMark,
} from '../domain/attendance';
import { AttendanceRepositoryPort } from '../port/attendance.repository.port';
import {
  ATTENDANCE_CONFLICT,
  AttendanceRecordEntity,
} from './entities/attendance-record.entity';
import {
  STAFF_ATTENDANCE_CONFLICT,
  StaffAttendanceEntity,
} from './entities/staff-attendance.entity';

@Injectable()
export class AttendanceRepository implements AttendanceRepositoryPort {
  constructor(private readonly db: DatabaseService) {}

  findRecords(
    enrolmentIds: readonly string[],
    date: string,
    period: number,
  ): Promise<AttendanceRecord[]> {
    if (enrolmentIds.length === 0) return Promise.resolve([]);
    return this.db.tenant((m) =>
      m.findBy(AttendanceRecordEntity, {
        enrolmentId: In([...enrolmentIds]),
        date,
        period,
      }),
    );
  }

  /**
   * New rows are inserted; existing ones get the new status and are stamped as updated.
   * `markedBy` / `markedAt` keep the first marking.
   */
  upsertMany(
    rows: readonly NewAttendanceRecord[],
    actorId: string,
  ): Promise<AttendanceRecord[]> {
    if (rows.length === 0) return Promise.resolve([]);
    const { date, period } = rows[0];
    return this.db.tenant(async (m) => {
      await m
        .createQueryBuilder()
        .insert()
        .into(AttendanceRecordEntity)
        .values([...rows])
        .orUpdate(
          ['status'],
          ATTENDANCE_CONFLICT.map((p) => this.column(p)),
        )
        .execute();
      const enrolmentIds = rows.map((r) => r.enrolmentId);
      // Only rows that already existed carry an earlier markedAt; stamp those as updated.
      await m
        .createQueryBuilder()
        .update(AttendanceRecordEntity)
        .set({ updatedBy: actorId, updatedAt: () => 'now()' })
        .where({ enrolmentId: In(enrolmentIds), date, period })
        .andWhere('marked_at < now()')
        .execute();
      return m.findBy(AttendanceRecordEntity, {
        enrolmentId: In(enrolmentIds),
        date,
        period,
      });
    });
  }

  findMonth(
    sectionId: string,
    sessionId: string,
    from: string,
    to: string,
  ): Promise<AttendanceRecord[]> {
    return this.db.tenant((m) =>
      m.findBy(AttendanceRecordEntity, {
        sectionId,
        sessionId,
        date: Between(from, to),
      }),
    );
  }

  async upsertStaffMany(rows: readonly NewStaffAttendance[]): Promise<number> {
    if (rows.length === 0) return 0;
    await this.db.tenant((m) =>
      m
        .createQueryBuilder()
        .insert()
        .into(StaffAttendanceEntity)
        .values([...rows])
        .orUpdate(
          ['status', 'marked_by', 'marked_at'],
          STAFF_ATTENDANCE_CONFLICT.map((p) => this.column(p)),
        )
        .execute(),
    );
    return rows.length;
  }

  async findStaffMarks(date: string): Promise<StaffMark[]> {
    const rows = await this.db.tenant((m) =>
      m.find(StaffAttendanceEntity, {
        select: { userId: true, status: true },
        where: { date },
      }),
    );
    return rows.map((row) => ({ userId: row.userId, status: row.status }));
  }

  /** `orUpdate` takes database column names, not property names. */
  private column(property: string): string {
    return property.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
  }
}
