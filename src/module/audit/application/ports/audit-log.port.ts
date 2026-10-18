import { AuditEntry } from '../../domain/audit-entry';

export abstract class AuditLogPort {
  /** Writes one entry or a batch in one statement; a no-op for an empty batch. */
  abstract record(entries: AuditEntry | AuditEntry[]): Promise<void>;
}
