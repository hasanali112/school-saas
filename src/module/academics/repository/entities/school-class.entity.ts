import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import type { SchoolClass } from '../../domain/school-class';

@Entity('classes')
@Unique('classes_tenant_key', ['institutionId', 'id'])
@Unique('classes_name_uq', ['institutionId', 'name'])
export class SchoolClassEntity implements SchoolClass {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  institutionId: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'integer' })
  ordinal: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
