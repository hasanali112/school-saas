import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import type { AcademicSession } from '../../domain/academic-session';

@Entity('academic_sessions')
@Unique('academic_sessions_tenant_key', ['institutionId', 'id'])
@Unique('academic_sessions_name_uq', ['institutionId', 'name'])
@Check('academic_sessions_dates_ck', `starts_on < ends_on`)
@Index('academic_sessions_one_current_uq', ['institutionId'], {
  unique: true,
  where: 'is_current',
})
export class AcademicSessionEntity implements AcademicSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  institutionId: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'date' })
  startsOn: string;

  @Column({ type: 'date' })
  endsOn: string;

  @Column({ type: 'boolean', default: false })
  isCurrent: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
