import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import type { Guardian } from '../../domain/guardian';

export const GUARDIAN_PHONE_CONFLICT = ['institutionId', 'phone'];

@Entity('guardians')
@Unique('guardians_tenant_key', ['institutionId', 'id'])
@Unique('guardians_institution_phone_uq', GUARDIAN_PHONE_CONFLICT)
export class GuardianEntity implements Guardian {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  institutionId: string;

  @Column({ type: 'text' })
  phone: string;

  @Column({ type: 'text' })
  name: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
