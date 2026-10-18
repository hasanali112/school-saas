import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Public } from '@module/auth/decorators/public.decorator';
import { DeliveryReportDto } from '../dto/delivery-report.dto';
import { DeliveryReportsFacade } from '../service/delivery-reports.facade';

const ONE_MINUTE_MS = 60_000;
/** Providers batch callbacks; generous, but still bounded per IP. */
const DLR_RATE_LIMIT = { default: { ttl: ONE_MINUTE_MS, limit: 600 } };

/** Provider callback endpoint; authenticated by shared secret, not by a user token. */
@Controller('sms/delivery-reports')
export class DeliveryReportsController {
  constructor(private readonly reports: DeliveryReportsFacade) {}

  @Post()
  @Public()
  @Throttle(DLR_RATE_LIMIT)
  @HttpCode(HttpStatus.NO_CONTENT)
  record(
    @Headers('x-delivery-report-secret') secret: string | undefined,
    @Body() dto: DeliveryReportDto,
  ): Promise<void> {
    return this.reports.record(secret, dto);
  }
}
