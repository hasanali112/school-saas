import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Workbook } from 'exceljs';
import { AuthUser } from '@common/types/auth-user';
import { Role } from '@common/types/role';
import { ClassesFacade } from '@module/academics/services/classes.facade';
import { SessionsFacade } from '@module/academics/services/sessions.facade';
import { createMock, getMock } from '@test/utils/create-mock';
import {
  ExcelJsSpreadsheet,
  toArrayBuffer,
} from '../infrastructure/adapters/exceljs.spreadsheet';
import { IMPORT_COLUMNS } from '../domain/import';
import { ImportRepository } from '../application/ports/import.repository.port';
import { SpreadsheetPort } from '../application/ports/spreadsheet.port';
import { ImportService } from './import.service';

const actor: AuthUser = {
  id: 'admin',
  institutionId: 'inst-1',
  roles: [Role.AdminOfficer],
};

type Cell = string | number | Date;
async function workbook(
  rows: Cell[][],
  headers: readonly string[] = IMPORT_COLUMNS,
): Promise<Buffer> {
  const wb = new Workbook();
  const sheet = wb.addWorksheet('students');
  sheet.addRow([...headers]);
  rows.forEach((r) => sheet.addRow(r));
  return Buffer.from(await wb.xlsx.writeBuffer());
}

const good = (
  admissionNo: string,
  roll: number,
  extra: Partial<Record<string, Cell>> = {},
): Cell[] => {
  const row: Record<string, Cell> = {
    admissionNo,
    nameBn: 'রহিম',
    nameEn: 'Rahim',
    dateOfBirth: new Date(Date.UTC(2013, 4, 14)),
    gender: 'male',
    bloodGroup: 'B+',
    religion: 'islam',
    birthCertificateNo: '',
    addressBn: '',
    addressEn: '',
    className: 'Six',
    sectionName: 'A',
    rollNo: roll,
    guardianName: 'করিম',
    guardianPhone: '01711111111',
    guardianRelation: 'father',
    ...extra,
  };
  return IMPORT_COLUMNS.map((c) => row[c] ?? '');
};

describe('ImportService', () => {
  let service: ImportService;
  let repo: jest.Mocked<ImportRepository>;
  let sessions: jest.Mocked<SessionsFacade>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      // The real spreadsheet adapter: these specs exercise actual workbooks.
      providers: [
        ImportService,
        { provide: SpreadsheetPort, useClass: ExcelJsSpreadsheet },
      ],
    })
      .useMocker(createMock)
      .compile();
    service = moduleRef.get(ImportService);
    repo = getMock(moduleRef, ImportRepository);
    sessions = getMock(moduleRef, SessionsFacade);

    sessions.resolveId.mockResolvedValue('sess-1');
    getMock(moduleRef, ClassesFacade).sectionRefs.mockResolvedValue([
      { sectionId: 'sec-a', classId: 'c6', className: 'Six', sectionName: 'A' },
    ]);
    repo.findExisting.mockResolvedValue({
      admissionNos: new Set(['EXISTS']),
      takenRolls: new Set(['sec-a:99']),
    });
    repo.importAll.mockImplementation((_i, _s, records) =>
      Promise.resolve(records.length),
    );
  });

  it('rejects a workbook with missing columns', async () => {
    const buffer = await workbook([['x']], ['admissionNo']);
    await expect(
      service.import(buffer, { dryRun: true }, actor, false),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('dry run reports every problem with the Excel row number and writes nothing', async () => {
    const buffer = await workbook([
      good('A-1', 1),
      good('A-1', 2), // duplicate admission in file
      good('EXISTS', 3), // already in DB
      good('A-4', 99), // roll taken in DB
      good('A-5', 5, { sectionName: 'Z' }), // unknown section
      good('A-6', 6, { guardianPhone: '' }), // partial guardian
      good('bad id!', 7, { gender: 'unknown' }), // validation errors
    ]);

    const { summary } = await service.import(
      buffer,
      { dryRun: true },
      actor,
      false,
    );

    expect(summary).toMatchObject({
      dryRun: true,
      totalRows: 7,
      validRows: 1,
      invalidRows: 6,
      imported: 0,
    });
    const byRow = Object.fromEntries(
      summary.errors.map((e) => [e.row, e.field]),
    );
    expect(byRow).toMatchObject({
      3: 'admissionNo',
      4: 'admissionNo',
      5: 'rollNo',
      6: 'sectionName',
      7: 'guardianPhone',
    });
    expect(
      summary.errors
        .filter((e) => e.row === 8)
        .map((e) => e.field)
        .sort(),
    ).toEqual(['admissionNo', 'gender']);
    expect(repo.importAll).not.toHaveBeenCalled();
  });

  it('a real import with any invalid row writes nothing', async () => {
    const buffer = await workbook([good('A-1', 1), good('A-1', 2)]);
    const { summary } = await service.import(
      buffer,
      { dryRun: false },
      actor,
      false,
    );
    expect(summary.imported).toBe(0);
    expect(repo.importAll).not.toHaveBeenCalled();
  });

  it('a clean real import converts dates, strips empties and passes guardian and section through', async () => {
    const buffer = await workbook([
      good('A-1', 1),
      good('A-2', 2, {
        guardianName: '',
        guardianPhone: '',
        guardianRelation: '',
      }),
    ]);
    const { summary } = await service.import(
      buffer,
      { dryRun: false },
      actor,
      false,
    );

    expect(summary).toMatchObject({
      validRows: 2,
      invalidRows: 0,
      imported: 2,
    });
    const [, sessionId, records] = repo.importAll.mock.calls[0];
    expect(sessionId).toBe('sess-1');
    expect(records[0]).toMatchObject({
      sectionId: 'sec-a',
      rollNo: 1,
      guardian: { phone: '01711111111', name: 'করিম', relation: 'father' },
      student: {
        admissionNo: 'A-1',
        dateOfBirth: '2013-05-14',
        bloodGroup: 'B+',
      },
    });
    expect(records[0].student).not.toHaveProperty('className');
    // Empty cells never become empty strings: they arrive as undefined and the insert omits them.
    expect(
      (records[0].student as { birthCertificateNo?: unknown })
        .birthCertificateNo,
    ).toBeUndefined();
    expect(records[1].guardian).toBeUndefined();
  });

  it('produces an error workbook containing only the failing rows', async () => {
    const buffer = await workbook([good('A-1', 1), good('A-1', 2)]);
    const { errorFile } = await service.import(
      buffer,
      { dryRun: true },
      actor,
      true,
    );
    expect(errorFile).toBeInstanceOf(Buffer);
    if (!errorFile) throw new Error('expected an error workbook');

    const wb = new Workbook();
    await wb.xlsx.load(toArrayBuffer(errorFile));
    const sheet = wb.worksheets[0];
    expect(sheet.rowCount).toBe(2); // header + one failing row
    expect(sheet.getRow(2).getCell(1).text).toBe('3');
    expect(sheet.getRow(2).getCell(IMPORT_COLUMNS.length + 2).text).toContain(
      'admissionNo',
    );
  });

  it('template has exactly the import columns as its header', async () => {
    const wb = new Workbook();
    await wb.xlsx.load(toArrayBuffer(await service.template()));
    const header = wb.worksheets[0].getRow(1).values as unknown[];
    expect(header.slice(1)).toEqual([...IMPORT_COLUMNS]);
  });
});
