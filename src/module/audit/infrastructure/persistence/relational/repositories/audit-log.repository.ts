import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@common/services/database/database.service';
import { currentInstitutionId } from '@common/services/database/tenant-context';
import { AuditEntry } from '../../../../domain/audit-entry';
import { AuditLogPort } from '../../../../application/ports/audit-log.port';
import { AuditLogEntity } from '../entities/audit-log.entity';
import { AuditLogMapper } from '../mappers/audit-log.mapper';

@Injectable()
export class AuditLogRelationalRepository implements AuditLogPort {
  constructor(private readonly db: DatabaseService) {}

  async record(entries: AuditEntry | AuditEntry[]): Promise<void> {
    const list = Array.isArray(entries) ? entries : [entries];
    if (list.length === 0) return;
    const institutionId = currentInstitutionId();
    await this.db.tenant((manager) =>
      manager.insert(
        AuditLogEntity,
        list.map((entry) => AuditLogMapper.toPersistence(entry, institutionId)),
      ),
    );
  }
}
