import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicsModule } from '@module/academics/academics.module';
import { LeaveModule } from '@module/leave/leave.module';
import { StudentsModule } from '@module/students/students.module';
import { UsersModule } from '@module/users/users.module';
import { AttendanceController } from './controller/attendance.controller';
import { AttendanceRepositoryPort } from './port/attendance.repository.port';
import { AttendanceRepository } from './repository/attendance.repository';
import { AttendanceRecordEntity } from './repository/entities/attendance-record.entity';
import { StaffAttendanceEntity } from './repository/entities/staff-attendance.entity';
import { AttendanceFacade } from './service/attendance.facade';
import { AttendanceService } from './service/attendance.service';

/** F1-05: student and staff attendance with the same-day / backdating / holiday rules. */
@Module({
  imports: [
    TypeOrmModule.forFeature([AttendanceRecordEntity, StaffAttendanceEntity]),
    AcademicsModule,
    StudentsModule,
    LeaveModule,
    UsersModule,
  ],
  controllers: [AttendanceController],
  providers: [
    AttendanceFacade,
    AttendanceService,
    { provide: AttendanceRepositoryPort, useClass: AttendanceRepository },
  ],
  exports: [AttendanceFacade],
})
export class AttendanceModule {}
