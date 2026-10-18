import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import type { Enrolment } from '../../domain/enrolment';

/** Composite tenant foreign keys (student, session, section, subjects) live in the migration. */
@Entity('enrolments')
@Unique('enrolments_tenant_key', ['institutionId', 'id'])
@Unique('enrolments_student_session_uq', [
  'institutionId',
  'sessionId',
  'studentId',
])
@Unique('enrolments_section_roll_uq', [
  'institutionId',
  'sessionId',
  'sectionId',
  'rollNo',
])
@Index('enrolments_section_idx', ['institutionId', 'sectionId', 'sessionId'])
export class EnrolmentEntity implements Enrolment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  institutionId: string;

  @Column({ type: 'uuid' })
  studentId: string;

  @Column({ type: 'uuid' })
  sessionId: string;

  @Column({ type: 'uuid' })
  sectionId: string;

  @Column({ type: 'integer' })
  rollNo: number;

  @Column({ type: 'uuid', nullable: true })
  fourthSubjectId: string | null;

  @Column({ type: 'uuid', nullable: true })
  religionSubjectId: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
