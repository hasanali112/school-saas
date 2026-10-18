import { Global, Module } from '@nestjs/common';
import { RelationalAuditPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

/** Shared kernel: every module can inject `AuditLogPort` without importing this module. */
@Global()
@Module({
  imports: [RelationalAuditPersistenceModule],
  exports: [RelationalAuditPersistenceModule],
})
export class AuditModule {}
