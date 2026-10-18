import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import type { SmsTemplate } from '../../domain/sms-template';

export const TEMPLATE_KEY_CONFLICT = ['institutionId', 'key'];

@Entity('sms_templates')
@Unique('sms_templates_key_uq', TEMPLATE_KEY_CONFLICT)
export class SmsTemplateEntity implements SmsTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  institutionId: string;

  @Column({ type: 'text' })
  key: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
