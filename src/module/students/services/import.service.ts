import { BadRequestException, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import type { SectionRef } from '@module/academics/domain/school-class';
import { ClassesFacade } from '@module/academics/services/classes.facade';
import { SessionsFacade } from '@module/academics/services/sessions.facade';
import type { AuthUser } from '@module/auth/domain/auth-user';
import { rollKey, sectionKey } from '../domain/import';
import type {
  ExistingRefs,
  ImportRecord,
  ImportRowError,
  RawRow,
} from '../domain/import';
import { ImportRowDto } from '../dto/import-row.dto';
import { ImportSummaryDto } from '../dto/import-summary.response.dto';
import { ImportRepository } from '../application/ports/import.repository.port';
import { SpreadsheetPort } from '../application/ports/spreadsheet.port';

const MAX_ROWS = 5000;

export interface ImportOptions {
  dryRun: boolean;
  sessionId?: string;
}

export interface ImportOutcome {
  summary: ImportSummaryDto;
  /** Present only when errors exist and the caller asked for the file. */
  errorFile?: Buffer;
}

/** Per-file state while rows are checked one by one. */
interface ImportContext {
  sectionMap: Map<string, SectionRef>;
  existing: ExistingRefs;
  seenAdmission: Set<string>;
  seenRoll: Set<string>;
}

/** One checked row: its errors, or the record to write. */
interface CheckedRow {
  errors: ImportRowError[];
  record?: ImportRecord;
}

/**
 * Primary data entry (F1-03): validate every row, report every problem at once,
 * and only write when the whole file is clean. Dry run never touches the database.
 */
@Injectable()
export class ImportService {
  constructor(
    private readonly repo: ImportRepository,
    private readonly spreadsheet: SpreadsheetPort,
    private readonly sessions: SessionsFacade,
    private readonly classes: ClassesFacade,
  ) {}

  template(): Promise<Buffer> {
    return this.spreadsheet.buildTemplate();
  }

  async import(
    buffer: Buffer,
    options: ImportOptions,
    actor: AuthUser,
    wantErrorFile: boolean,
  ): Promise<ImportOutcome> {
    const { rows, rowNumbers } = await this.spreadsheet.readRows(buffer);
    if (rows.length === 0)
      throw new BadRequestException('The sheet has no data rows');
    if (rows.length > MAX_ROWS)
      throw new BadRequestException(`At most ${MAX_ROWS} rows per import`);

    const [sessionId, sectionRefs] = await Promise.all([
      this.sessions.resolveId(options.sessionId),
      this.classes.sectionRefs(),
    ]);
    const existing = await this.repo.findExisting(
      rows.map((r) => r.admissionNo).filter(Boolean),
      sessionId,
    );
    const context: ImportContext = {
      sectionMap: new Map(
        sectionRefs.map((s) => [sectionKey(s.className, s.sectionName), s]),
      ),
      existing,
      seenAdmission: new Set(),
      seenRoll: new Set(),
    };

    const errors: ImportRowError[] = [];
    const records: ImportRecord[] = [];
    for (let i = 0; i < rows.length; i++) {
      const checked = await this.checkRow(rows[i], rowNumbers[i], context);
      errors.push(...checked.errors);
      if (checked.record) records.push(checked.record);
    }

    const invalidRows = new Set(errors.map((e) => e.row)).size;
    const imported =
      options.dryRun || invalidRows > 0
        ? 0
        : await this.repo.importAll(actor.institutionId, sessionId, records);

    const summary = new ImportSummaryDto(
      options.dryRun,
      rows.length,
      records.length,
      invalidRows,
      imported,
      errors,
    );
    const errorFile =
      wantErrorFile && errors.length
        ? await this.spreadsheet.buildErrorFile(rows, rowNumbers, errors)
        : undefined;
    return { summary, errorFile };
  }

  private async checkRow(
    raw: RawRow,
    rowNumber: number,
    context: ImportContext,
  ): Promise<CheckedRow> {
    const dto = plainToInstance(ImportRowDto, this.stripEmpty(raw));
    const errors = this.flatten(
      rowNumber,
      await validate(dto, { whitelist: true, forbidNonWhitelisted: true }),
    );
    const fail = (field: string, message: string): void => {
      errors.push({ row: rowNumber, field, message });
    };

    const section = context.sectionMap.get(
      sectionKey(dto.className ?? '', dto.sectionName ?? ''),
    );
    if (dto.className && dto.sectionName && !section)
      fail(
        'sectionName',
        `No section "${dto.sectionName}" in class "${dto.className}"`,
      );

    if (dto.admissionNo) {
      if (context.seenAdmission.has(dto.admissionNo))
        fail('admissionNo', 'Duplicated in this file');
      else if (context.existing.admissionNos.has(dto.admissionNo))
        fail('admissionNo', 'Already exists');
      context.seenAdmission.add(dto.admissionNo);
    }

    if (section && dto.rollNo) {
      const key = rollKey(section.sectionId, dto.rollNo);
      if (context.seenRoll.has(key)) fail('rollNo', 'Duplicated in this file');
      else if (context.existing.takenRolls.has(key))
        fail('rollNo', 'Roll already taken in this section');
      context.seenRoll.add(key);
    }

    const guardianParts = [
      dto.guardianName,
      dto.guardianPhone,
      dto.guardianRelation,
    ];
    const hasGuardianPart = guardianParts.some(Boolean);
    const hasFullGuardian = guardianParts.every(Boolean);
    if (hasGuardianPart && !hasFullGuardian)
      fail(
        'guardianPhone',
        'guardianName, guardianPhone and guardianRelation go together',
      );

    if (errors.length || !section) return { errors };
    return {
      errors,
      record: this.toRecord(dto, section.sectionId, hasFullGuardian),
    };
  }

  private stripEmpty(raw: RawRow): RawRow {
    const out: RawRow = {};
    for (const [key, value] of Object.entries(raw))
      if (value !== '') out[key] = value;
    return out;
  }

  private flatten(
    row: number,
    validationErrors: ValidationError[],
  ): ImportRowError[] {
    return validationErrors.map((e) => ({
      row,
      field: e.property,
      message: Object.values(
        e.constraints ?? { invalid: 'invalid value' },
      ).join(', '),
    }));
  }

  private toRecord(
    dto: ImportRowDto,
    sectionId: string,
    withGuardian: boolean,
  ): ImportRecord {
    const {
      className: _className,
      sectionName: _sectionName,
      rollNo,
      guardianName,
      guardianPhone,
      guardianRelation,
      ...student
    } = dto;
    return {
      student,
      sectionId,
      rollNo,
      guardian:
        withGuardian && guardianName && guardianPhone && guardianRelation
          ? {
              phone: guardianPhone,
              name: guardianName,
              relation: guardianRelation,
            }
          : undefined,
    };
  }
}
