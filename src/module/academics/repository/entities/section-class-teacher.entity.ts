import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import type { SectionClassTeacher } from '../../domain/teacher-assignment';

export const CLASS_TEACHER_CONFLICT = [
  'institutionId',
  'sessionId',
  'sectionId',
];

@Entity('section_class_teachers')
@Unique('section_class_teachers_uq', CLASS_TEACHER_CONFLICT)
export class SectionClassTeacherEntity implements SectionClassTeacher {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  institutionId: string;

  @Column({ type: 'uuid' })
  sessionId: string;

  @Column({ type: 'uuid' })
  sectionId: string;

  @Column({ type: 'uuid' })
  teacherUserId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
