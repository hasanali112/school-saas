import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { LeaveAppliesTo } from '../../domain/leave';
import type { LeaveType } from '../../domain/leave';

@Entity('leave_types')
@Unique('leave_types_tenant_key', ['institutionId', 'id'])
@Unique('leave_types_institution_name_uq', ['institutionId', 'name'])
export class LeaveTypeEntity implements LeaveType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  institutionId: string;

  @Column({ type: 'text' })
  name: string;

  @Column({
    type: 'enum',
    enum: LeaveAppliesTo,
    enumName: 'leave_applies_to',
    default: LeaveAppliesTo.Both,
  })
  appliesTo: LeaveAppliesTo;

  @Column({ type: 'integer', nullable: true })
  maxDaysPerYear: number | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
