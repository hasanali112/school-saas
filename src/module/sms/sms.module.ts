import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { httpConfig } from '@config/http/http.config';
import { AcademicsModule } from '@modules/academics/academics.module';
import { InstitutionsModule } from '@modules/institutions/institutions.module';
import { AbsenceSmsListener } from './absence/absence-sms.listener';
import { AudienceRepository } from './audience/audience.repository';
import { AudienceService } from './audience/audience.service';
import { BalanceController } from './balance/balance.controller';
import { BalanceRepository } from './balance/balance.repository';
import { BalanceService } from './balance/balance.service';
import { BatchesRepository } from './batches/batches.repository';
import { BatchesService } from './batches/batches.service';
import { DeliveryReportsController } from './delivery/delivery-reports.controller';
import { DeliveryReportsRepository } from './delivery/delivery-reports.repository';
import { DeliveryReportsService } from './delivery/delivery-reports.service';
import { smsGatewayProvider } from './gateway/sms-gateway.provider';
import { SmsController } from './sms.controller';
import { SmsService } from './sms.service';
import { TemplatesController } from './templates/templates.controller';
import { TemplatesRepository } from './templates/templates.repository';
import { TemplatesService } from './templates/templates.service';

/**
 * F1-12: dual-gateway sending, segment pricing, templates, audience builder with
 * consent filtering, cost preview, delivery log, balance ledger and the absence draft.
 */
@Module({
  imports: [
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
    SmsService,
    AudienceService,
    AudienceRepository,
    TemplatesService,
    TemplatesRepository,
    BalanceService,
    BalanceRepository,
    BatchesService,
    BatchesRepository,
    DeliveryReportsService,
    DeliveryReportsRepository,
    AbsenceSmsListener,
  ],
  exports: [SmsService, BatchesService],
})
export class SmsModule {}
