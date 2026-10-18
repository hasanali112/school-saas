import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Religion } from '@module/academics/domain/subject';
import { BloodGroup, Gender, StudentStatus } from '../../domain/student';
import type { Student } from '../../domain/student';

@Entity('students')
@Unique('students_tenant_key', ['institutionId', 'id'])
@Unique('students_institution_admission_uq', ['institutionId', 'admissionNo'])
@Index('students_institution_name_idx', ['institutionId', 'nameEn'])
export class StudentEntity implements Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  institutionId: string;

  @Column({ type: 'text' })
  admissionNo: string;

  @Column({ type: 'text' })
  nameBn: string;

  @Column({ type: 'text' })
  nameEn: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: string | null;

  @Column({ type: 'enum', enum: Gender, enumName: 'gender', nullable: true })
  gender: Gender | null;

  @Column({
    type: 'enum',
    enum: BloodGroup,
    enumName: 'blood_group',
    nullable: true,
  })
  bloodGroup: BloodGroup | null;

  @Column({
    type: 'enum',
    enum: Religion,
    enumName: 'religion',
    nullable: true,
  })
  religion: Religion | null;

  @Column({ type: 'text', nullable: true })
  birthCertificateNo: string | null;

  @Column({ type: 'text', nullable: true })
  addressBn: string | null;

  @Column({ type: 'text', nullable: true })
  addressEn: string | null;

  @Column({ type: 'text', nullable: true })
  photoKey: string | null;

  @Column({
    type: 'enum',
    enum: StudentStatus,
    enumName: 'student_status',
    default: StudentStatus.Active,
  })
  status: StudentStatus;

  @Column({ type: 'timestamptz', nullable: true })
  exitedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  exitReason: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
