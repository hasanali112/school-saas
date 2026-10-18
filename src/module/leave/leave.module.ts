import { Module } from '@nestjs/common';
import { RelationalLeavePersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { LeaveController } from './controllers/leave.controller';
import { LeaveFacade } from './services/leave.facade';
import { LeaveService } from './services/leave.service';

/** F1-05: leave types, applications and approvals for staff and students. */
@Module({
  imports: [RelationalLeavePersistenceModule],
  controllers: [LeaveController],
  providers: [LeaveFacade, LeaveService],
  exports: [LeaveService],
})
export class LeaveModule {}
