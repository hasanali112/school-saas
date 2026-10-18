import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import type { Section } from '../../domain/school-class';

/** Composite foreign keys to classes and shifts are declared in the migration. */
@Entity('sections')
@Unique('sections_tenant_key', ['institutionId', 'id'])
@Unique('sections_class_name_uq', ['institutionId', 'classId', 'name'])
export class SectionEntity implements Section {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  institutionId: string;

  @Column({ type: 'uuid' })
  classId: string;

  @Column({ type: 'uuid', nullable: true })
  shiftId: string | null;

  @Column({ type: 'text' })
  name: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
