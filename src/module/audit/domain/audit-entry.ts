export type AuditValue = string | number | boolean | null;

/** A small, flat picture of the changed fields; never a whole row. */
export interface AuditSnapshot {
  [field: string]: AuditValue;
}

/** One append-only audit line: backdated, overriding or financial actions (CLAUDE.md). */
export interface AuditEntry {
  actorId: string;
  action: string;
  entity: string;
  entityId?: string;
  before?: AuditSnapshot | null;
  after?: AuditSnapshot | null;
  reason?: string;
}
