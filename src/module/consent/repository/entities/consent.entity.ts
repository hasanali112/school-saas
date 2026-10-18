import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { ConsentPurpose, ConsentSource } from '../../domain/consent';
import type { Consent } from '../../domain/consent';

export const CONSENT_CONFLICT = ['institutionId', 'guardianId', 'purpose'];

@Entity('consents')
@Unique('consents_guardian_purpose_uq', CONSENT_CONFLICT)
export class ConsentEntity implements Consent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  institutionId: string;

  @Column({ type: 'uuid' })
  guardianId: string;

  @Column({ type: 'enum', enum: ConsentPurpose, enumName: 'consent_purpose' })
  purpose: ConsentPurpose;

  @Column({ type: 'boolean' })
  granted: boolean;

  @Column({ type: 'text' })
  noticeVersion: string;

  @Column({ type: 'enum', enum: ConsentSource, enumName: 'consent_source' })
  source: ConsentSource;

  @Column({ type: 'uuid', nullable: true })
  recordedBy: string | null;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
