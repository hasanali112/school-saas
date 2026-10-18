import { Module } from '@nestjs/common';
import { AcademicsModule } from '@module/academics/academics.module';
import { RelationalStudentsPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { ExcelJsSpreadsheet } from './infrastructure/adapters/exceljs.spreadsheet';
import { EnrolmentsController } from './controllers/enrolments.controller';
import { GuardiansController } from './controllers/guardians.controller';
import { ImportController } from './controllers/import.controller';
import { StudentsController } from './controllers/students.controller';
import { SpreadsheetPort } from './application/ports/spreadsheet.port';
import { EnrolmentsFacade } from './services/enrolments.facade';
import { EnrolmentsService } from './services/enrolments.service';
import { GuardiansFacade } from './services/guardians.facade';
import { GuardiansService } from './services/guardians.service';
import { ImportFacade } from './services/import.facade';
import { ImportService } from './services/import.service';
import { StudentsFacade } from './services/students.facade';
import { StudentsService } from './services/students.service';

/** F1-03 digital register: students, per-session enrolment, guardians, bulk import. */
@Module({
  imports: [RelationalStudentsPersistenceModule, AcademicsModule],
  // ImportController first: its static "students/import/template" route must win over "students/:id".
  controllers: [
    ImportController,
    StudentsController,
    EnrolmentsController,
    GuardiansController,
  ],
  providers: [
    StudentsFacade,
    StudentsService,
    EnrolmentsFacade,
    EnrolmentsService,
    GuardiansFacade,
    GuardiansService,
    ImportFacade,
    ImportService,
    { provide: SpreadsheetPort, useClass: ExcelJsSpreadsheet },
  ],
  exports: [
    StudentsService,
    EnrolmentsService,
    GuardiansService,
    ImportService,
  ],
})
export class StudentsModule {}
