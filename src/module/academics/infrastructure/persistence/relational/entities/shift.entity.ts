import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('shifts')
@Unique('shifts_tenant_key', ['institutionId', 'id'])
@Unique('shifts_name_uq', ['institutionId', 'name'])
export class ShiftEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  institutionId: string;

  @Column({ type: 'text' })
  name: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
