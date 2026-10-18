import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionsRepository } from '../../../application/ports/sessions.repository.port';
import { ShiftsRepository } from '../../../application/ports/shifts.repository.port';
import { ClassesRepository } from '../../../application/ports/classes.repository.port';
import { SubjectsRepository } from '../../../application/ports/subjects.repository.port';
import { TeachersRepository } from '../../../application/ports/teachers.repository.port';
import { HolidaysRepository } from '../../../application/ports/holidays.repository.port';
import { AcademicSessionEntity } from './entities/academic-session.entity';
import { ShiftEntity } from './entities/shift.entity';
import { SchoolClassEntity } from './entities/school-class.entity';
import { SectionEntity } from './entities/section.entity';
import { SubjectEntity } from './entities/subject.entity';
import { ClassSubjectEntity } from './entities/class-subject.entity';
import { TeacherAssignmentEntity } from './entities/teacher-assignment.entity';
import { SectionClassTeacherEntity } from './entities/section-class-teacher.entity';
import { HolidayEntity } from './entities/holiday.entity';
import { SessionsRelationalRepository } from './repositories/sessions.repository';
import { ShiftsRelationalRepository } from './repositories/shifts.repository';
import { ClassesRelationalRepository } from './repositories/classes.repository';
import { SubjectsRelationalRepository } from './repositories/subjects.repository';
import { TeachersRelationalRepository } from './repositories/teachers.repository';
import { HolidaysRelationalRepository } from './repositories/holidays.repository';

/** TypeORM side of the academics module: its entities, and each repository port bound to its relational adapter. */
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
  providers: [
    { provide: SessionsRepository, useClass: SessionsRelationalRepository },
    { provide: ShiftsRepository, useClass: ShiftsRelationalRepository },
    { provide: ClassesRepository, useClass: ClassesRelationalRepository },
    { provide: SubjectsRepository, useClass: SubjectsRelationalRepository },
    { provide: TeachersRepository, useClass: TeachersRelationalRepository },
    { provide: HolidaysRepository, useClass: HolidaysRelationalRepository },
  ],
  exports: [
    SessionsRepository,
    ShiftsRepository,
    ClassesRepository,
    SubjectsRepository,
    TeachersRepository,
    HolidaysRepository,
  ],
})
export class RelationalAcademicsPersistenceModule {}
