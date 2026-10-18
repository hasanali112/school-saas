import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceRepository } from '../../../application/ports/attendance.repository.port';
import { AttendanceRecordEntity } from './entities/attendance-record.entity';
import { StaffAttendanceEntity } from './entities/staff-attendance.entity';
import { AttendanceRelationalRepository } from './repositories/attendance.repository';

/** TypeORM side of the attendance module: its entities, and each repository port bound to its relational adapter. */
@Module({
  imports: [
    TypeOrmModule.forFeature([AttendanceRecordEntity, StaffAttendanceEntity]),
  ],
  providers: [
    { provide: AttendanceRepository, useClass: AttendanceRelationalRepository },
  ],
  exports: [AttendanceRepository],
})
export class RelationalAttendancePersistenceModule {}
