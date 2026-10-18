import { Module } from '@nestjs/common';
import { AcademicsModule } from '@modules/academics/academics.module';
import { AttendanceController } from './attendance.controller';
import { AttendanceRepository } from './attendance.repository';
import { AttendanceService } from './attendance.service';

/** F1-05: student and staff attendance with the same-day / backdating / holiday rules. */
@Module({
  imports: [AcademicsModule],
  controllers: [AttendanceController],
  providers: [AttendanceService, AttendanceRepository],
  exports: [AttendanceService],
})
export class AttendanceModule {}
