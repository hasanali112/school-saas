import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { httpConfig } from '@config/http/http.config';
import { AcademicsModule } from '@module/academics/academics.module';
import { InstitutionsModule } from '@module/institutions/institutions.module';
import { RelationalSmsPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { smsGatewayProvider } from './infrastructure/adapters/gateway/sms-gateway.provider';
import { BalanceController } from './controllers/balance.controller';
import { DeliveryReportsController } from './controllers/delivery-reports.controller';
import { SmsController } from './controllers/sms.controller';
import { TemplatesController } from './controllers/templates.controller';
import { AbsenceSmsListener } from './listeners/absence-sms.listener';
import { AudienceService } from './services/audience.service';
import { BalanceFacade } from './services/balance.facade';
import { BalanceService } from './services/balance.service';
import { BatchesFacade } from './services/batches.facade';
import { BatchesService } from './services/batches.service';
import { DeliveryReportsFacade } from './services/delivery-reports.facade';
import { DeliveryReportsService } from './services/delivery-reports.service';
import { SmsFacade } from './services/sms.facade';
import { SmsService } from './services/sms.service';
import { TemplatesFacade } from './services/templates.facade';
import { TemplatesService } from './services/templates.service';

/**
 * F1-12: dual-gateway sending, segment pricing, templates, audience builder with
 * consent filtering, cost preview, delivery log, balance ledger and the absence draft.
 */
@Module({
  imports: [
    RelationalSmsPersistenceModule,
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
    TemplatesFacade,
    TemplatesService,
    BalanceFacade,
    BalanceService,
    BatchesFacade,
    BatchesService,
    DeliveryReportsFacade,
    DeliveryReportsService,
    AbsenceSmsListener,
  ],
  exports: [SmsFacade],
})
export class SmsModule {}
