import type { ImportRowError, ParsedSheet, RawRow } from '../../domain/import';

/** Excel in and out; services see typed rows, never cells. */
export abstract class SpreadsheetPort {
  /** Reads the first worksheet; throws 400 for an unreadable file or missing columns. */
  abstract readRows(buffer: Buffer): Promise<ParsedSheet>;
  abstract buildTemplate(): Promise<Buffer>;
  /** Only the failing rows, original columns, plus an `errors` column. */
  abstract buildErrorFile(
    rows: readonly RawRow[],
    rowNumbers: readonly number[],
    errors: readonly ImportRowError[],
  ): Promise<Buffer>;
}
