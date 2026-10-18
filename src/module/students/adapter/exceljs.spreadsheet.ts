import { BadRequestException, Injectable } from '@nestjs/common';
import { Workbook } from 'exceljs';
import { IMPORT_COLUMNS } from '../domain/import';
import type { ImportRowError, ParsedSheet, RawRow } from '../domain/import';
import { SpreadsheetPort } from '../port/spreadsheet.port';

const HEADER_ROW = 1;
const FIRST_DATA_ROW = 2;
const ISO_DATE_LENGTH = 10;

/** The shapes exceljs uses for formula, rich-text and hyperlink cells. */
interface CellObject {
  result?: unknown;
  text?: string;
  richText?: { text: string }[];
}

/** exceljs types its input as a plain ArrayBuffer, so a Node Buffer is copied into one (uploads are capped at 5 MB). */
export function toArrayBuffer(buffer: Buffer): ArrayBuffer {
  const out = new ArrayBuffer(buffer.byteLength);
  new Uint8Array(out).set(buffer);
  return out;
}

/** The only file in the students module that knows about cells and workbooks. */
@Injectable()
export class ExcelJsSpreadsheet implements SpreadsheetPort {
  async readRows(buffer: Buffer): Promise<ParsedSheet> {
    const workbook = new Workbook();
    try {
      await workbook.xlsx.load(toArrayBuffer(buffer));
    } catch {
      throw new BadRequestException('File is not a readable .xlsx workbook');
    }
    const sheet = workbook.worksheets[0];
    if (!sheet) throw new BadRequestException('Workbook has no worksheets');

    const headers: string[] = [];
    sheet.getRow(HEADER_ROW).eachCell({ includeEmpty: true }, (cell, col) => {
      headers[col] = this.cellToString(cell.value);
    });
    const missing = IMPORT_COLUMNS.filter((c) => !headers.includes(c));
    if (missing.length)
      throw new BadRequestException(`Missing columns: ${missing.join(', ')}`);

    const rows: RawRow[] = [];
    const rowNumbers: number[] = [];
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber < FIRST_DATA_ROW) return;
      const raw: RawRow = {};
      let hasValue = false;
      row.eachCell({ includeEmpty: true }, (cell, col) => {
        const header = headers[col];
        if (!header) return;
        const text = this.cellToString(cell.value);
        if (text) hasValue = true;
        raw[header] = text;
      });
      if (!hasValue) return;
      rows.push(raw);
      rowNumbers.push(rowNumber);
    });
    return { rows, rowNumbers };
  }

  /** Header row plus one example row, so the office never types headers by hand. */
  async buildTemplate(): Promise<Buffer> {
    const workbook = new Workbook();
    const sheet = workbook.addWorksheet('students');
    sheet.addRow([...IMPORT_COLUMNS]);
    sheet.addRow([
      '2026-001',
      'রহিম উদ্দিন',
      'Rahim Uddin',
      '2013-05-14',
      'male',
      'B+',
      'islam',
      '',
      'ঢাকা',
      'Dhaka',
      'Six',
      'A',
      1,
      'করিম উদ্দিন',
      '01711111111',
      'father',
    ]);
    sheet.getRow(HEADER_ROW).font = { bold: true };
    return Buffer.from(await workbook.xlsx.writeBuffer());
  }

  async buildErrorFile(
    rows: readonly RawRow[],
    rowNumbers: readonly number[],
    errors: readonly ImportRowError[],
  ): Promise<Buffer> {
    const byRow = new Map<number, string[]>();
    for (const error of errors) {
      const bucket = byRow.get(error.row);
      const text = `${error.field}: ${error.message}`;
      if (bucket) bucket.push(text);
      else byRow.set(error.row, [text]);
    }

    const workbook = new Workbook();
    const sheet = workbook.addWorksheet('errors');
    sheet.addRow(['row', ...IMPORT_COLUMNS, 'errors']);
    sheet.getRow(HEADER_ROW).font = { bold: true };
    rows.forEach((row, index) => {
      const rowNumber = rowNumbers[index];
      const messages = byRow.get(rowNumber);
      if (!messages) return;
      sheet.addRow([
        rowNumber,
        ...IMPORT_COLUMNS.map((c) => row[c] ?? ''),
        messages.join('; '),
      ]);
    });
    return Buffer.from(await workbook.xlsx.writeBuffer());
  }

  /** Excel cell → trimmed string. Dates become ISO dates; formulas resolve to their result. */
  private cellToString(value: unknown): string {
    if (value == null) return '';
    if (value instanceof Date)
      return value.toISOString().slice(0, ISO_DATE_LENGTH);
    if (typeof value === 'object') {
      const v = value as CellObject;
      if ('result' in v) return this.cellToString(v.result);
      if (v.richText)
        return v.richText
          .map((r) => r.text)
          .join('')
          .trim();
      if (typeof v.text === 'string') return v.text.trim();
    }
    if (typeof value === 'string') return value.trim();
    if (
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      typeof value === 'bigint'
    )
      return String(value);
    return '';
  }
}
