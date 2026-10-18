import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { GuardianRelation } from '../../../../domain/guardian';

@Entity('student_guardians')
@Unique('student_guardians_uq', ['institutionId', 'studentId', 'guardianId'])
@Index('student_guardians_guardian_idx', ['institutionId', 'guardianId'])
export class StudentGuardianEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  institutionId: string;

  @Column({ type: 'uuid' })
  studentId: string;

  @Column({ type: 'uuid' })
  guardianId: string;

  @Column({
    type: 'enum',
    enum: GuardianRelation,
    enumName: 'guardian_relation',
  })
  relation: GuardianRelation;

  @Column({ type: 'boolean', default: false })
  isPrimary: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
