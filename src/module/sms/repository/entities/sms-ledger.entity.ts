import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SmsLedgerKind } from '../../domain/sms';
import type { SmsLedgerEntry } from '../../domain/sms-balance';

/** Append-only like the audit log: a trigger rejects UPDATE and DELETE. */
@Entity('sms_ledger')
@Index('sms_ledger_created_idx', ['institutionId', 'createdAt'])
export class SmsLedgerEntity implements SmsLedgerEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  institutionId: string;

  @Column({ type: 'enum', enum: SmsLedgerKind, enumName: 'sms_ledger_kind' })
  kind: SmsLedgerKind;

  @Column({ type: 'integer' })
  amountPaisa: number;

  @Column({ type: 'integer' })
  balanceAfterPaisa: number;

  @Column({ type: 'uuid', nullable: true })
  batchId: string | null;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @Column({ type: 'uuid', nullable: true })
  actorId: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
