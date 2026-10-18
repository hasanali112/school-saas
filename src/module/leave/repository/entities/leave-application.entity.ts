import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApplicantKind, LeaveStatus } from '../../domain/leave';
import type { LeaveApplication } from '../../domain/leave';

@Entity('leave_applications')
@Index('leave_applications_status_idx', ['institutionId', 'status'])
@Index('leave_applications_student_dates_idx', [
  'institutionId',
  'studentId',
  'fromDate',
  'toDate',
])
@Check(
  'leave_applications_applicant_ck',
  `(applicant_kind = 'staff' AND user_id IS NOT NULL AND student_id IS NULL) OR (applicant_kind = 'student' AND student_id IS NOT NULL AND user_id IS NULL)`,
)
@Check('leave_applications_dates_ck', `from_date <= to_date`)
export class LeaveApplicationEntity implements LeaveApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  institutionId: string;

  @Column({ type: 'uuid' })
  leaveTypeId: string;

  @Column({ type: 'enum', enum: ApplicantKind, enumName: 'applicant_kind' })
  applicantKind: ApplicantKind;

  @Column({ type: 'uuid', nullable: true })
  userId: string | null;

  @Column({ type: 'uuid', nullable: true })
  studentId: string | null;

  @Column({ type: 'date' })
  fromDate: string;

  @Column({ type: 'date' })
  toDate: string;

  @Column({ type: 'text' })
  reason: string;

  @Column({
    type: 'enum',
    enum: LeaveStatus,
    enumName: 'leave_status',
    default: LeaveStatus.Pending,
  })
  status: LeaveStatus;

  @Column({ type: 'uuid' })
  appliedBy: string;

  @Column({ type: 'uuid', nullable: true })
  decidedBy: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  decidedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  decisionNote: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
