import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SmsMessageStatus } from '../../../../domain/sms';

@Entity('sms_messages')
@Index('sms_messages_batch_idx', ['institutionId', 'batchId'])
@Index('sms_messages_provider_idx', ['providerMessageId'])
export class SmsMessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  institutionId: string;

  @Column({ type: 'uuid' })
  batchId: string;

  @Column({ type: 'uuid', nullable: true })
  guardianId: string | null;

  @Column({ type: 'uuid', nullable: true })
  studentId: string | null;

  @Column({ type: 'text' })
  phone: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'integer' })
  segments: number;

  @Column({ type: 'integer' })
  costPaisa: number;

  @Column({
    type: 'enum',
    enum: SmsMessageStatus,
    enumName: 'sms_message_status',
    default: SmsMessageStatus.Pending,
  })
  status: SmsMessageStatus;

  @Column({ type: 'text', nullable: true })
  gateway: string | null;

  @Column({ type: 'text', nullable: true })
  providerMessageId: string | null;

  @Column({ type: 'text', nullable: true })
  error: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  sentAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  deliveredAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
