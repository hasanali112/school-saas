import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Role } from '@module/auth/domain/role';
import { UserStatus } from '../../domain/user';
import type { User } from '../../domain/user';

@Entity('users')
@Unique('users_tenant_key', ['institutionId', 'id'])
@Unique('users_institution_phone_uq', ['institutionId', 'phone'])
@Index('users_phone_idx', ['phone'])
export class UserEntity implements User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  institutionId: string;

  @Column({ type: 'text' })
  phone: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', nullable: true })
  passwordHash: string | null;

  @Column({ type: 'text', array: true })
  roles: Role[];

  @Column({
    type: 'enum',
    enum: UserStatus,
    enumName: 'user_status',
    default: UserStatus.Active,
  })
  status: UserStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
