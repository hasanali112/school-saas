import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveController } from './controller/leave.controller';
import { LeaveRepositoryPort } from './port/leave.repository.port';
import { LeaveApplicationEntity } from './repository/entities/leave-application.entity';
import { LeaveTypeEntity } from './repository/entities/leave-type.entity';
import { LeaveRepository } from './repository/leave.repository';
import { LeaveFacade } from './service/leave.facade';
import { LeaveService } from './service/leave.service';

/** F1-05: leave types, applications and approvals for staff and students. */
@Module({
  imports: [
    TypeOrmModule.forFeature([LeaveTypeEntity, LeaveApplicationEntity]),
  ],
  controllers: [LeaveController],
  providers: [
    LeaveFacade,
    LeaveService,
    { provide: LeaveRepositoryPort, useClass: LeaveRepository },
  ],
  exports: [LeaveFacade],
})
export class LeaveModule {}
