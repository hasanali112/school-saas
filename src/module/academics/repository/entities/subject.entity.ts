import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Religion, SubjectKind } from '../../domain/subject';
import type { Subject } from '../../domain/subject';

@Entity('subjects')
@Unique('subjects_tenant_key', ['institutionId', 'id'])
@Unique('subjects_code_uq', ['institutionId', 'code'])
@Check('subjects_religion_ck', `(kind = 'religion') = (religion IS NOT NULL)`)
export class SubjectEntity implements Subject {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  institutionId: string;

  @Column({ type: 'text' })
  code: string;

  @Column({ type: 'text' })
  nameBn: string;

  @Column({ type: 'text' })
  nameEn: string;

  @Column({
    type: 'enum',
    enum: SubjectKind,
    enumName: 'subject_kind',
    default: SubjectKind.General,
  })
  kind: SubjectKind;

  @Column({
    type: 'enum',
    enum: Religion,
    enumName: 'religion',
    nullable: true,
  })
  religion: Religion | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
