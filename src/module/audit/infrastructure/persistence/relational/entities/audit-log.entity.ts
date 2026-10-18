import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { AuditSnapshot } from '../../../../domain/audit-entry';

/** Append-only: a trigger rejects UPDATE and DELETE (see the initial migration). */
@Entity('audit_log')
@Index('audit_log_entity_idx', ['institutionId', 'entity', 'entityId'])
export class AuditLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  institutionId: string;

  @Column({ type: 'uuid' })
  actorId: string;

  @Column({ type: 'text' })
  action: string;

  @Column({ type: 'text' })
  entity: string;

  @Column({ type: 'text', nullable: true })
  entityId: string | null;

  @Column({ type: 'jsonb', nullable: true })
  before: AuditSnapshot | null;

  @Column({ type: 'jsonb', nullable: true })
  after: AuditSnapshot | null;

  @Column({ type: 'text', nullable: true })
  reason: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
