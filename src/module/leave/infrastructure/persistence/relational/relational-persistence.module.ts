import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveRepository } from '../../../application/ports/leave.repository.port';
import { LeaveTypeEntity } from './entities/leave-type.entity';
import { LeaveApplicationEntity } from './entities/leave-application.entity';
import { LeaveRelationalRepository } from './repositories/leave.repository';

/** TypeORM side of the leave module: its entities, and each repository port bound to its relational adapter. */
@Module({
  imports: [
    TypeOrmModule.forFeature([LeaveTypeEntity, LeaveApplicationEntity]),
  ],
  providers: [
    { provide: LeaveRepository, useClass: LeaveRelationalRepository },
  ],
  exports: [LeaveRepository],
})
export class RelationalLeavePersistenceModule {}
