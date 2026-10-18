import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ClassSubjectRole } from '../../../../domain/subject';

@Entity('class_subjects')
@Unique('class_subjects_uq', ['institutionId', 'classId', 'subjectId'])
export class ClassSubjectEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  institutionId: string;

  @Column({ type: 'uuid' })
  classId: string;

  @Column({ type: 'uuid' })
  subjectId: string;

  @Column({
    type: 'enum',
    enum: ClassSubjectRole,
    enumName: 'class_subject_role',
    default: ClassSubjectRole.Compulsory,
  })
  role: ClassSubjectRole;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
