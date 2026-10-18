import { Module } from '@nestjs/common';
import { LeaveController } from './leave.controller';
import { LeaveRepository } from './leave.repository';
import { LeaveService } from './leave.service';

/** F1-05: leave types, applications and approvals for staff and students. */
@Module({
  controllers: [LeaveController],
  providers: [LeaveService, LeaveRepository],
  exports: [LeaveService],
})
export class LeaveModule {}
