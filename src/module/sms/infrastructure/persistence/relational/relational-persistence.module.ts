import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AudienceRepository } from '../../../application/ports/audience.repository.port';
import { TemplatesRepository } from '../../../application/ports/templates.repository.port';
import { BalanceRepository } from '../../../application/ports/balance.repository.port';
import { BatchesRepository } from '../../../application/ports/batches.repository.port';
import { DeliveryReportsRepository } from '../../../application/ports/delivery-reports.repository.port';
import { SmsTemplateEntity } from './entities/sms-template.entity';
import { SmsBatchEntity } from './entities/sms-batch.entity';
import { SmsMessageEntity } from './entities/sms-message.entity';
import { SmsBalanceEntity } from './entities/sms-balance.entity';
import { SmsLedgerEntity } from './entities/sms-ledger.entity';
import { AudienceRelationalRepository } from './repositories/audience.repository';
import { TemplatesRelationalRepository } from './repositories/templates.repository';
import { BalanceRelationalRepository } from './repositories/balance.repository';
import { BatchesRelationalRepository } from './repositories/batches.repository';
import { DeliveryReportsRelationalRepository } from './repositories/delivery-reports.repository';

/** TypeORM side of the sms module: its entities, and each repository port bound to its relational adapter. */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      SmsTemplateEntity,
      SmsBatchEntity,
      SmsMessageEntity,
      SmsBalanceEntity,
      SmsLedgerEntity,
    ]),
  ],
  providers: [
    { provide: AudienceRepository, useClass: AudienceRelationalRepository },
    { provide: TemplatesRepository, useClass: TemplatesRelationalRepository },
    { provide: BalanceRepository, useClass: BalanceRelationalRepository },
    { provide: BatchesRepository, useClass: BatchesRelationalRepository },
    {
      provide: DeliveryReportsRepository,
      useClass: DeliveryReportsRelationalRepository,
    },
  ],
  exports: [
    AudienceRepository,
    TemplatesRepository,
    BalanceRepository,
    BatchesRepository,
    DeliveryReportsRepository,
  ],
})
export class RelationalSmsPersistenceModule {}
