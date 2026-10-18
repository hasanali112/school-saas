import { BadRequestException, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { AuthUser } from '@modules/auth/auth-user';
import { SessionsService } from '@modules/academics/sessions/sessions.service';
import { ImportRowDto } from './import-row.dto';
import {
  ImportRecord,
  ImportRepository,
  rollKey,
  sectionKey,
} from './import.repository';
import { ImportRowError, ImportSummaryDto, RawRow } from './import.types';
import { buildErrorFile, buildTemplate, readRows } from './spreadsheet';

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

/**
 * Primary data entry (F1-03): validate every row, report every problem at once,
 * and only write when the whole file is clean. Dry run never touches the database.
 */
@Injectable()
export class ImportService {
  constructor(
    private readonly repo: ImportRepository,
    private readonly sessions: SessionsService,
  ) {}

  template(): Promise<Buffer> {
    return buildTemplate();
  }

  async import(
    buffer: Buffer,
    options: ImportOptions,
    actor: AuthUser,
    wantErrorFile: boolean,
  ): Promise<ImportOutcome> {
    const { rows, rowNumbers } = await readRows(buffer);
    if (rows.length === 0)
      throw new BadRequestException('The sheet has no data rows');
    if (rows.length > MAX_ROWS)
      throw new BadRequestException(`At most ${MAX_ROWS} rows per import`);

    const [sessionId, sectionMap] = await Promise.all([
      this.sessions.resolveId(options.sessionId),
      this.repo.findSectionMap(),
    ]);
    const existing = await this.repo.findExisting(
      rows.map((r) => r.admissionNo).filter(Boolean),
      sessionId,
    );

    const errors: ImportRowError[] = [];
    const records: ImportRecord[] = [];
    const seenAdmission = new Set<string>();
    const seenRoll = new Set<string>();

    for (let i = 0; i < rows.length; i++) {
      const rowNumber = rowNumbers[i];
      const dto = plainToInstance(ImportRowDto, this.stripEmpty(rows[i]));
      const rowErrors = this.flatten(
        rowNumber,
        await validate(dto, { whitelist: true, forbidNonWhitelisted: true }),
      );

      const section = sectionMap.get(
        sectionKey(dto.className ?? '', dto.sectionName ?? ''),
      );
      if (dto.className && dto.sectionName && !section) {
        rowErrors.push({
          row: rowNumber,
          field: 'sectionName',
          message: `No section "${dto.sectionName}" in class "${dto.className}"`,
        });
      }
      if (dto.admissionNo) {
        if (seenAdmission.has(dto.admissionNo))
          rowErrors.push({
            row: rowNumber,
            field: 'admissionNo',
            message: 'Duplicated in this file',
          });
        else if (existing.admissionNos.has(dto.admissionNo))
          rowErrors.push({
            row: rowNumber,
            field: 'admissionNo',
            message: 'Already exists',
          });
        seenAdmission.add(dto.admissionNo);
      }
      if (section && dto.rollNo) {
        const key = rollKey(section.sectionId, dto.rollNo);
        if (seenRoll.has(key))
          rowErrors.push({
            row: rowNumber,
            field: 'rollNo',
            message: 'Duplicated in this file',
          });
        else if (existing.takenRolls.has(key))
          rowErrors.push({
            row: rowNumber,
            field: 'rollNo',
            message: 'Roll already taken in this section',
          });
        seenRoll.add(key);
      }
      const hasGuardianPart = !!(
        dto.guardianName ||
        dto.guardianPhone ||
        dto.guardianRelation
      );
      const hasFullGuardian = !!(
        dto.guardianName &&
        dto.guardianPhone &&
        dto.guardianRelation
      );
      if (hasGuardianPart && !hasFullGuardian) {
        rowErrors.push({
          row: rowNumber,
          field: 'guardianPhone',
          message:
            'guardianName, guardianPhone and guardianRelation go together',
        });
      }

      if (rowErrors.length) {
        errors.push(...rowErrors);
        continue;
      }
      records.push(this.toRecord(dto, section!.sectionId, hasFullGuardian));
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
        ? await buildErrorFile(rows, rowNumbers, errors)
        : undefined;
    return { summary, errorFile };
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
      className,
      sectionName,
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
      guardian: withGuardian
        ? {
            phone: guardianPhone!,
            name: guardianName!,
            relation: guardianRelation!,
          }
        : undefined,
    };
  }
}
