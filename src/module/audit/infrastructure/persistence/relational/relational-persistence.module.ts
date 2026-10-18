import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogPort } from '../../../application/ports/audit-log.port';
import { AuditLogEntity } from './entities/audit-log.entity';
import { AuditLogRelationalRepository } from './repositories/audit-log.repository';

/** TypeORM side of the audit module: its entities, and each repository port bound to its relational adapter. */
@Module({
  imports: [TypeOrmModule.forFeature([AuditLogEntity])],
  providers: [
    { provide: AuditLogPort, useClass: AuditLogRelationalRepository },
  ],
  exports: [AuditLogPort],
})
export class RelationalAuditPersistenceModule {}
