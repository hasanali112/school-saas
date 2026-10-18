import type { ExistingRefs, ImportRecord } from '../../domain/import';

export abstract class ImportRepository {
  /** Two set-based queries so the dry run can report clashes with existing data. */
  abstract findExisting(
    admissionNos: readonly string[],
    sessionId: string,
  ): Promise<ExistingRefs>;
  /** All-or-nothing: batched statements inside one transaction. Returns students written. */
  abstract importAll(
    institutionId: string,
    sessionId: string,
    records: readonly ImportRecord[],
  ): Promise<number>;
}
