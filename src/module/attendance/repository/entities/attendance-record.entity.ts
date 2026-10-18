import { Column, Entity, Index, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { AttendanceStatus, DAILY_PERIOD } from '../../domain/attendance';
import type { AttendanceRecord } from '../../domain/attendance';

export const ATTENDANCE_CONFLICT = [
  'institutionId',
  'enrolmentId',
  'date',
  'period',
];

/** Composite tenant foreign keys (session, section, enrolment, student) live in the migration. */
@Entity('attendance_records')
@Unique('attendance_enrolment_date_period_uq', ATTENDANCE_CONFLICT)
@Index('attendance_section_date_idx', ['institutionId', 'sectionId', 'date'])
export class AttendanceRecordEntity implements AttendanceRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  institutionId: string;

  @Column({ type: 'uuid' })
  sessionId: string;

  @Column({ type: 'uuid' })
  sectionId: string;

  @Column({ type: 'uuid' })
  enrolmentId: string;

  @Column({ type: 'uuid' })
  studentId: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'integer', default: DAILY_PERIOD })
  period: number;

  @Column({
    type: 'enum',
    enum: AttendanceStatus,
    enumName: 'attendance_status',
  })
  status: AttendanceStatus;

  @Column({ type: 'uuid' })
  markedBy: string;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  markedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  updatedAt: Date | null;
}
