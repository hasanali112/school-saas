import type { AuditEntry } from '../../../../domain/audit-entry';
import { AuditLogEntity } from '../entities/audit-log.entity';

/** Converts an audit entry into its append-only TypeORM row. */
export class AuditLogMapper {
  static toPersistence(
    entry: AuditEntry,
    institutionId: string,
  ): AuditLogEntity {
    const entity = new AuditLogEntity();
    entity.institutionId = institutionId;
    entity.actorId = entry.actorId;
    entity.action = entry.action;
    entity.entity = entry.entity;
    entity.entityId = entry.entityId ?? null;
    entity.before = entry.before ?? null;
    entity.after = entry.after ?? null;
    entity.reason = entry.reason ?? null;
    return entity;
  }
}
