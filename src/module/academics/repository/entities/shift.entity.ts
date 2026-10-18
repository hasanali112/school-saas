import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import type { Shift } from '../../domain/shift';

@Entity('shifts')
@Unique('shifts_tenant_key', ['institutionId', 'id'])
@Unique('shifts_name_uq', ['institutionId', 'name'])
export class ShiftEntity implements Shift {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  institutionId: string;

  @Column({ type: 'text' })
  name: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
