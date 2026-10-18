import type { ImportRowError } from '../domain/import';

export class ImportSummaryDto {
  constructor(
    readonly dryRun: boolean,
    readonly totalRows: number,
    readonly validRows: number,
    readonly invalidRows: number,
    readonly imported: number,
    readonly errors: ImportRowError[],
  ) {}
}
