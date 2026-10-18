import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassesController } from './controller/classes.controller';
import { HolidaysController } from './controller/holidays.controller';
import { SessionsController } from './controller/sessions.controller';
import { ShiftsController } from './controller/shifts.controller';
import { SubjectsController } from './controller/subjects.controller';
import { TeachersController } from './controller/teachers.controller';
import { ClassesRepositoryPort } from './port/classes.repository.port';
import { HolidaysRepositoryPort } from './port/holidays.repository.port';
import { SessionsRepositoryPort } from './port/sessions.repository.port';
import { ShiftsRepositoryPort } from './port/shifts.repository.port';
import { SubjectsRepositoryPort } from './port/subjects.repository.port';
import { TeachersRepositoryPort } from './port/teachers.repository.port';
import { ClassesRepository } from './repository/classes.repository';
import { AcademicSessionEntity } from './repository/entities/academic-session.entity';
import { ClassSubjectEntity } from './repository/entities/class-subject.entity';
import { HolidayEntity } from './repository/entities/holiday.entity';
import { SchoolClassEntity } from './repository/entities/school-class.entity';
import { SectionClassTeacherEntity } from './repository/entities/section-class-teacher.entity';
import { SectionEntity } from './repository/entities/section.entity';
import { ShiftEntity } from './repository/entities/shift.entity';
import { SubjectEntity } from './repository/entities/subject.entity';
import { TeacherAssignmentEntity } from './repository/entities/teacher-assignment.entity';
import { HolidaysRepository } from './repository/holidays.repository';
import { SessionsRepository } from './repository/sessions.repository';
import { ShiftsRepository } from './repository/shifts.repository';
import { SubjectsRepository } from './repository/subjects.repository';
import { TeachersRepository } from './repository/teachers.repository';
import { ClassesFacade } from './service/classes.facade';
import { ClassesService } from './service/classes.service';
import { HolidaysFacade } from './service/holidays.facade';
import { HolidaysService } from './service/holidays.service';
import { SessionsFacade } from './service/sessions.facade';
import { SessionsService } from './service/sessions.service';
import { ShiftsFacade } from './service/shifts.facade';
import { ShiftsService } from './service/shifts.service';
import { SubjectsFacade } from './service/subjects.facade';
import { SubjectsService } from './service/subjects.service';
import { TeachersFacade } from './service/teachers.facade';
import { TeachersService } from './service/teachers.service';

/** F1-02 / F1-10: sessions, shifts, classes and sections, subjects, teacher assignment, holidays. */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      AcademicSessionEntity,
      ShiftEntity,
      SchoolClassEntity,
      SectionEntity,
      SubjectEntity,
      ClassSubjectEntity,
      TeacherAssignmentEntity,
      SectionClassTeacherEntity,
      HolidayEntity,
    ]),
  ],
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
    { provide: SessionsRepositoryPort, useClass: SessionsRepository },
    ShiftsFacade,
    ShiftsService,
    { provide: ShiftsRepositoryPort, useClass: ShiftsRepository },
    ClassesFacade,
    ClassesService,
    { provide: ClassesRepositoryPort, useClass: ClassesRepository },
    SubjectsFacade,
    SubjectsService,
    { provide: SubjectsRepositoryPort, useClass: SubjectsRepository },
    TeachersFacade,
    TeachersService,
    { provide: TeachersRepositoryPort, useClass: TeachersRepository },
    HolidaysFacade,
    HolidaysService,
    { provide: HolidaysRepositoryPort, useClass: HolidaysRepository },
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
