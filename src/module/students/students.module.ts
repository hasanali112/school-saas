import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicsModule } from '@module/academics/academics.module';
import { ExcelJsSpreadsheet } from './adapter/exceljs.spreadsheet';
import { EnrolmentsController } from './controller/enrolments.controller';
import { GuardiansController } from './controller/guardians.controller';
import { ImportController } from './controller/import.controller';
import { StudentsController } from './controller/students.controller';
import { EnrolmentsRepositoryPort } from './port/enrolments.repository.port';
import { GuardiansRepositoryPort } from './port/guardians.repository.port';
import { ImportRepositoryPort } from './port/import.repository.port';
import { SpreadsheetPort } from './port/spreadsheet.port';
import { StudentsRepositoryPort } from './port/students.repository.port';
import { EnrolmentsRepository } from './repository/enrolments.repository';
import { EnrolmentEntity } from './repository/entities/enrolment.entity';
import { GuardianEntity } from './repository/entities/guardian.entity';
import { StudentGuardianEntity } from './repository/entities/student-guardian.entity';
import { StudentEntity } from './repository/entities/student.entity';
import { GuardiansRepository } from './repository/guardians.repository';
import { ImportRepository } from './repository/import.repository';
import { StudentsRepository } from './repository/students.repository';
import { EnrolmentsFacade } from './service/enrolments.facade';
import { EnrolmentsService } from './service/enrolments.service';
import { GuardiansFacade } from './service/guardians.facade';
import { GuardiansService } from './service/guardians.service';
import { ImportFacade } from './service/import.facade';
import { ImportService } from './service/import.service';
import { StudentsFacade } from './service/students.facade';
import { StudentsService } from './service/students.service';

/** F1-03 digital register: students, per-session enrolment, guardians, bulk import. */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      StudentEntity,
      EnrolmentEntity,
      GuardianEntity,
      StudentGuardianEntity,
    ]),
    AcademicsModule,
  ],
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
    { provide: StudentsRepositoryPort, useClass: StudentsRepository },
    EnrolmentsFacade,
    EnrolmentsService,
    { provide: EnrolmentsRepositoryPort, useClass: EnrolmentsRepository },
    GuardiansFacade,
    GuardiansService,
    { provide: GuardiansRepositoryPort, useClass: GuardiansRepository },
    ImportFacade,
    ImportService,
    { provide: ImportRepositoryPort, useClass: ImportRepository },
    { provide: SpreadsheetPort, useClass: ExcelJsSpreadsheet },
  ],
  exports: [StudentsFacade, EnrolmentsFacade, GuardiansFacade],
})
export class StudentsModule {}
