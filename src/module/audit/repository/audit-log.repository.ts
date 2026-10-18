import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@common/services/database/database.service';
import { currentInstitutionId } from '@common/services/database/tenant-context';
import { AuditEntry } from '../domain/audit-entry';
import { AuditLogPort } from '../port/audit-log.port';
import { AuditLogEntity } from './entities/audit-log.entity';

@Injectable()
export class AuditLogRepository implements AuditLogPort {
  constructor(private readonly db: DatabaseService) {}

  async record(entries: AuditEntry | AuditEntry[]): Promise<void> {
    const list = Array.isArray(entries) ? entries : [entries];
    if (list.length === 0) return;
    const institutionId = currentInstitutionId();
    await this.db.tenant((manager) =>
      manager.insert(
        AuditLogEntity,
        list.map((entry) => ({
          institutionId,
          actorId: entry.actorId,
          action: entry.action,
          entity: entry.entity,
          entityId: entry.entityId ?? null,
          before: entry.before ?? null,
          after: entry.after ?? null,
          reason: entry.reason ?? null,
        })),
      ),
    );
  }
}
