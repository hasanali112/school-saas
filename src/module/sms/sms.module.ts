import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { httpConfig } from '@config/http/http.config';
import { AcademicsModule } from '@module/academics/academics.module';
import { InstitutionsModule } from '@module/institutions/institutions.module';
import { smsGatewayProvider } from './adapter/gateway/sms-gateway.provider';
import { BalanceController } from './controller/balance.controller';
import { DeliveryReportsController } from './controller/delivery-reports.controller';
import { SmsController } from './controller/sms.controller';
import { TemplatesController } from './controller/templates.controller';
import { AbsenceSmsListener } from './listener/absence-sms.listener';
import { AudienceRepositoryPort } from './port/audience.repository.port';
import { BalanceRepositoryPort } from './port/balance.repository.port';
import { BatchesRepositoryPort } from './port/batches.repository.port';
import { DeliveryReportsRepositoryPort } from './port/delivery-reports.repository.port';
import { TemplatesRepositoryPort } from './port/templates.repository.port';
import { AudienceRepository } from './repository/audience.repository';
import { BalanceRepository } from './repository/balance.repository';
import { BatchesRepository } from './repository/batches.repository';
import { DeliveryReportsRepository } from './repository/delivery-reports.repository';
import { SmsBalanceEntity } from './repository/entities/sms-balance.entity';
import { SmsBatchEntity } from './repository/entities/sms-batch.entity';
import { SmsLedgerEntity } from './repository/entities/sms-ledger.entity';
import { SmsMessageEntity } from './repository/entities/sms-message.entity';
import { SmsTemplateEntity } from './repository/entities/sms-template.entity';
import { TemplatesRepository } from './repository/templates.repository';
import { AudienceService } from './service/audience.service';
import { BalanceFacade } from './service/balance.facade';
import { BalanceService } from './service/balance.service';
import { BatchesFacade } from './service/batches.facade';
import { BatchesService } from './service/batches.service';
import { DeliveryReportsFacade } from './service/delivery-reports.facade';
import { DeliveryReportsService } from './service/delivery-reports.service';
import { SmsFacade } from './service/sms.facade';
import { SmsService } from './service/sms.service';
import { TemplatesFacade } from './service/templates.facade';
import { TemplatesService } from './service/templates.service';

/**
 * F1-12: dual-gateway sending, segment pricing, templates, audience builder with
 * consent filtering, cost preview, delivery log, balance ledger and the absence draft.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      SmsTemplateEntity,
      SmsBatchEntity,
      SmsMessageEntity,
      SmsBalanceEntity,
      SmsLedgerEntity,
    ]),
    HttpModule.registerAsync({
      inject: [httpConfig.KEY],
      useFactory: (http: ConfigType<typeof httpConfig>) => ({
        timeout: http.timeoutMs,
        maxRedirects: 0,
      }),
    }),
    AcademicsModule,
    InstitutionsModule,
  ],
  // Static routes (balance, templates, delivery-reports) before the parametrised sms/* ones.
  controllers: [
    BalanceController,
    TemplatesController,
    DeliveryReportsController,
    SmsController,
  ],
  providers: [
    smsGatewayProvider,
    SmsFacade,
    SmsService,
    AudienceService,
    { provide: AudienceRepositoryPort, useClass: AudienceRepository },
    TemplatesFacade,
    TemplatesService,
    { provide: TemplatesRepositoryPort, useClass: TemplatesRepository },
    BalanceFacade,
    BalanceService,
    { provide: BalanceRepositoryPort, useClass: BalanceRepository },
    BatchesFacade,
    BatchesService,
    { provide: BatchesRepositoryPort, useClass: BatchesRepository },
    DeliveryReportsFacade,
    DeliveryReportsService,
    {
      provide: DeliveryReportsRepositoryPort,
      useClass: DeliveryReportsRepository,
    },
    AbsenceSmsListener,
  ],
  exports: [SmsFacade],
})
export class SmsModule {}
