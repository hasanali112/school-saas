import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { HolidayKind } from '../../domain/holiday';
import type { Holiday } from '../../domain/holiday';

@Entity('holidays')
@Unique('holidays_date_uq', ['institutionId', 'date'])
export class HolidayEntity implements Holiday {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  institutionId: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'text' })
  nameBn: string;

  @Column({ type: 'text' })
  nameEn: string;

  @Column({ type: 'enum', enum: HolidayKind, enumName: 'holiday_kind' })
  kind: HolidayKind;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
