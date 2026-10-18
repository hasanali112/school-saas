import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

export const GUARDIAN_PHONE_CONFLICT = ['institutionId', 'phone'];

@Entity('guardians')
@Unique('guardians_tenant_key', ['institutionId', 'id'])
@Unique('guardians_institution_phone_uq', GUARDIAN_PHONE_CONFLICT)
export class GuardianEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  institutionId: string;

  @Column({ type: 'text' })
  phone: string;

  @Column({ type: 'text' })
  name: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
