import type { GuardianRelation } from './guardian';
import type { StudentDetails } from './student';

/** Column headers of the import template, in order; they match `ImportRowDto` properties. */
export const IMPORT_COLUMNS = [
  'admissionNo',
  'nameBn',
  'nameEn',
  'dateOfBirth',
  'gender',
  'bloodGroup',
  'religion',
  'birthCertificateNo',
  'addressBn',
  'addressEn',
  'className',
  'sectionName',
  'rollNo',
  'guardianName',
  'guardianPhone',
  'guardianRelation',
] as const;

export type ImportColumn = (typeof IMPORT_COLUMNS)[number];

export interface ImportGuardian {
  phone: string;
  name: string;
  relation: GuardianRelation;
}

/** One clean row, ready to write. */
export interface ImportRecord {
  student: StudentDetails;
  sectionId: string;
  rollNo: number;
  guardian?: ImportGuardian;
}

/** What already exists, so the dry run can report clashes. */
export interface ExistingRefs {
  admissionNos: Set<string>;
  /** `${sectionId}:${rollNo}` keys taken in the session. */
  takenRolls: Set<string>;
}

export interface ImportRowError {
  /** 1-based spreadsheet row number, as the user sees it in Excel. */
  row: number;
  field: string;
  message: string;
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

/** Key of a roll number inside a section, as stored in `ExistingRefs.takenRolls`. */
export function rollKey(sectionId: string, rollNo: number): string {
  return `${sectionId}:${rollNo}`;
}

/** "Six" + "A" → "six/a": how an import row finds its section, ignoring case and spaces. */
export function sectionKey(className: string, sectionName: string): string {
  return `${className.trim().toLowerCase()}/${sectionName.trim().toLowerCase()}`;
}
