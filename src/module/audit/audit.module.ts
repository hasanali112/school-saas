import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogPort } from './port/audit-log.port';
import { AuditLogEntity } from './repository/entities/audit-log.entity';
import { AuditLogRepository } from './repository/audit-log.repository';

/** Shared kernel: every module can inject `AuditLogPort` without importing this module. */
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([AuditLogEntity])],
  providers: [{ provide: AuditLogPort, useClass: AuditLogRepository }],
  exports: [AuditLogPort],
})
export class AuditModule {}
