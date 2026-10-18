import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import type { TeacherAssignment } from '../../domain/teacher-assignment';

export const TEACHER_ASSIGNMENT_CONFLICT = [
  'institutionId',
  'sessionId',
  'sectionId',
  'subjectId',
];

@Entity('teacher_assignments')
@Unique('teacher_assignments_uq', TEACHER_ASSIGNMENT_CONFLICT)
@Index('teacher_assignments_teacher_idx', [
  'institutionId',
  'teacherUserId',
  'sessionId',
])
export class TeacherAssignmentEntity implements TeacherAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  institutionId: string;

  @Column({ type: 'uuid' })
  sessionId: string;

  @Column({ type: 'uuid' })
  sectionId: string;

  @Column({ type: 'uuid' })
  subjectId: string;

  @Column({ type: 'uuid' })
  teacherUserId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
