import { Module } from '@nestjs/common';
import { AcademicsModule } from '@module/academics/academics.module';
import { LeaveModule } from '@module/leave/leave.module';
import { StudentsModule } from '@module/students/students.module';
import { UsersModule } from '@module/users/users.module';
import { RelationalAttendancePersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { AttendanceController } from './controllers/attendance.controller';
import { AttendanceFacade } from './services/attendance.facade';
import { AttendanceService } from './services/attendance.service';

/** F1-05: student and staff attendance with the same-day / backdating / holiday rules. */
@Module({
  imports: [
    RelationalAttendancePersistenceModule,
    AcademicsModule,
    StudentsModule,
    LeaveModule,
    UsersModule,
  ],
  controllers: [AttendanceController],
  providers: [AttendanceFacade, AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
