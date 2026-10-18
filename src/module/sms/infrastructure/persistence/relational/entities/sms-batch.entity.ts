import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { SmsBatchStatus, SmsPurpose } from '../../../../domain/sms';

@Entity('sms_batches')
@Unique('sms_batches_tenant_key', ['institutionId', 'id'])
@Index('sms_batches_status_idx', ['institutionId', 'status', 'createdAt'])
@Index('sms_batches_dedupe_uq', ['institutionId', 'dedupeKey'], {
  unique: true,
  where: 'dedupe_key IS NOT NULL',
})
export class SmsBatchEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  institutionId: string;

  @Column({ type: 'enum', enum: SmsPurpose, enumName: 'sms_purpose' })
  purpose: SmsPurpose;

  @Column({
    type: 'enum',
    enum: SmsBatchStatus,
    enumName: 'sms_batch_status',
    default: SmsBatchStatus.Draft,
  })
  status: SmsBatchStatus;

  @Column({ type: 'text', nullable: true })
  templateKey: string | null;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'text', nullable: true })
  dedupeKey: string | null;

  @Column({ type: 'integer' })
  recipientCount: number;

  @Column({ type: 'integer' })
  segmentCount: number;

  @Column({ type: 'integer' })
  costPaisa: number;

  @Column({ type: 'integer', default: 0 })
  sentCount: number;

  @Column({ type: 'integer', default: 0 })
  failedCount: number;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string | null;

  @Column({ type: 'uuid', nullable: true })
  sentBy: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  sentAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
