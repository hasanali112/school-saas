import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsRepository } from '../../../application/ports/students.repository.port';
import { EnrolmentsRepository } from '../../../application/ports/enrolments.repository.port';
import { GuardiansRepository } from '../../../application/ports/guardians.repository.port';
import { ImportRepository } from '../../../application/ports/import.repository.port';
import { StudentEntity } from './entities/student.entity';
import { EnrolmentEntity } from './entities/enrolment.entity';
import { GuardianEntity } from './entities/guardian.entity';
import { StudentGuardianEntity } from './entities/student-guardian.entity';
import { StudentsRelationalRepository } from './repositories/students.repository';
import { EnrolmentsRelationalRepository } from './repositories/enrolments.repository';
import { GuardiansRelationalRepository } from './repositories/guardians.repository';
import { ImportRelationalRepository } from './repositories/import.repository';

/** TypeORM side of the students module: its entities, and each repository port bound to its relational adapter. */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      StudentEntity,
      EnrolmentEntity,
      GuardianEntity,
      StudentGuardianEntity,
    ]),
  ],
  providers: [
    { provide: StudentsRepository, useClass: StudentsRelationalRepository },
    { provide: EnrolmentsRepository, useClass: EnrolmentsRelationalRepository },
    { provide: GuardiansRepository, useClass: GuardiansRelationalRepository },
    { provide: ImportRepository, useClass: ImportRelationalRepository },
  ],
  exports: [
    StudentsRepository,
    EnrolmentsRepository,
    GuardiansRepository,
    ImportRepository,
  ],
})
export class RelationalStudentsPersistenceModule {}
