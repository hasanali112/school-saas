import { Module } from '@nestjs/common';
import { AcademicsModule } from '@modules/academics/academics.module';
import { EnrolmentsController } from './enrolments/enrolments.controller';
import { EnrolmentsRepository } from './enrolments/enrolments.repository';
import { EnrolmentsService } from './enrolments/enrolments.service';
import { GuardiansController } from './guardians/guardians.controller';
import { GuardiansRepository } from './guardians/guardians.repository';
import { GuardiansService } from './guardians/guardians.service';
import { ImportController } from './import/import.controller';
import { ImportRepository } from './import/import.repository';
import { ImportService } from './import/import.service';
import { StudentsController } from './students.controller';
import { StudentsRepository } from './students.repository';
import { StudentsService } from './students.service';

/** F1-03 digital register: students, per-session enrolment, guardians, bulk import. */
@Module({
  imports: [AcademicsModule],
  // ImportController first: its static "students/import/template" route must win over "students/:id".
  controllers: [
    ImportController,
    StudentsController,
    EnrolmentsController,
    GuardiansController,
  ],
  providers: [
    StudentsService,
    StudentsRepository,
    EnrolmentsService,
    EnrolmentsRepository,
    GuardiansService,
    GuardiansRepository,
    ImportService,
    ImportRepository,
  ],
  exports: [StudentsService, EnrolmentsService, GuardiansService],
})
export class StudentsModule {}
