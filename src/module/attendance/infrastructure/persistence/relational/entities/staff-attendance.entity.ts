import { Column, Entity, Index, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { AttendanceStatus } from '../../../../domain/attendance';

export const STAFF_ATTENDANCE_CONFLICT = ['institutionId', 'userId', 'date'];

@Entity('staff_attendance')
@Unique('staff_attendance_user_date_uq', STAFF_ATTENDANCE_CONFLICT)
@Index('staff_attendance_date_idx', ['institutionId', 'date'])
export class StaffAttendanceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  institutionId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'date' })
  date: string;

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
}
