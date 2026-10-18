export interface ImportRowError {
  /** 1-based spreadsheet row number, as the user sees it in Excel. */
  row: number;
  field: string;
  message: string;
}

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

/** A raw spreadsheet row: every cell as a trimmed string keyed by header. */
export interface RawRow {
  [header: string]: string;
}

/** The first worksheet, parsed: one RawRow per non-blank row plus its 1-based row number. */
export interface ParsedSheet {
  rows: RawRow[];
  rowNumbers: number[];
}
