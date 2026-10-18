import { BadRequestException } from '@nestjs/common';
import { Workbook } from 'exceljs';
import { IMPORT_COLUMNS } from './import-row.dto';
import { ImportRowError, ParsedSheet, RawRow } from './import.types';

const HEADER_ROW = 1;
const FIRST_DATA_ROW = 2;
const ISO_DATE_LENGTH = 10;

/** Excel cell → trimmed string. Dates become ISO dates; formulas resolve to their result. */
function cellToString(value: unknown): string {
  if (value == null) return '';
  if (value instanceof Date)
    return value.toISOString().slice(0, ISO_DATE_LENGTH);
  if (typeof value === 'object') {
    const v = value as {
      result?: unknown;
      text?: string;
      richText?: Array<{ text: string }>;
    };
    if ('result' in v) return cellToString(v.result);
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

/** exceljs types its input as a plain ArrayBuffer, so a Node Buffer is copied into one (uploads are capped at 5 MB). */
export function toArrayBuffer(buffer: Buffer): ArrayBuffer {
  const out = new ArrayBuffer(buffer.byteLength);
  new Uint8Array(out).set(buffer);
  return out;
}

/** Reads the first worksheet into raw rows keyed by header; blank rows are skipped. */
export async function readRows(buffer: Buffer): Promise<ParsedSheet> {
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
    headers[col] = cellToString(cell.value);
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
      const text = cellToString(cell.value);
      if (text) hasValue = true;
      raw[header] = text;
    });
    if (!hasValue) return;
    rows.push(raw);
    rowNumbers.push(rowNumber);
  });
  return { rows, rowNumbers };
}

/** The blank template: header row plus one example row, so the office never types headers by hand. */
export async function buildTemplate(): Promise<Buffer> {
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

/** The error file: only the failing rows, original columns, plus an `errors` column. */
export async function buildErrorFile(
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
