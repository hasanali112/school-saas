import { Module } from '@nestjs/common';
import { RelationalAcademicsPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { ClassesController } from './controllers/classes.controller';
import { HolidaysController } from './controllers/holidays.controller';
import { SessionsController } from './controllers/sessions.controller';
import { ShiftsController } from './controllers/shifts.controller';
import { SubjectsController } from './controllers/subjects.controller';
import { TeachersController } from './controllers/teachers.controller';
import { ClassesFacade } from './services/classes.facade';
import { ClassesService } from './services/classes.service';
import { HolidaysFacade } from './services/holidays.facade';
import { HolidaysService } from './services/holidays.service';
import { SessionsFacade } from './services/sessions.facade';
import { SessionsService } from './services/sessions.service';
import { ShiftsFacade } from './services/shifts.facade';
import { ShiftsService } from './services/shifts.service';
import { SubjectsFacade } from './services/subjects.facade';
import { SubjectsService } from './services/subjects.service';
import { TeachersFacade } from './services/teachers.facade';
import { TeachersService } from './services/teachers.service';

/** F1-02 / F1-10: sessions, shifts, classes and sections, subjects, teacher assignment, holidays. */
@Module({
  imports: [RelationalAcademicsPersistenceModule],
  // TeachersController first: its static "teachers/me/assignments" route must win over the parametrised ones.
  controllers: [
    TeachersController,
    SessionsController,
    ShiftsController,
    ClassesController,
    SubjectsController,
    HolidaysController,
  ],
  providers: [
    SessionsFacade,
    SessionsService,
    ShiftsFacade,
    ShiftsService,
    ClassesFacade,
    ClassesService,
    SubjectsFacade,
    SubjectsService,
    TeachersFacade,
    TeachersService,
    HolidaysFacade,
    HolidaysService,
  ],
  exports: [
    SessionsFacade,
    ClassesFacade,
    SubjectsFacade,
    TeachersFacade,
    HolidaysFacade,
  ],
})
export class AcademicsModule {}
