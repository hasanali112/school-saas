import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { timingSafeEqual } from 'node:crypto';
import { smsConfig } from '@config/sms/sms.config';
import { DeliveryReportDto } from '../dto/delivery-report.dto';
import { DeliveryReportsRepository } from './delivery-reports.repository';

/** Inbound delivery reports (F1-12 §1). Unauthenticated route, so the shared secret is the only gate. */
@Injectable()
export class DeliveryReportsService {
  private readonly secret?: Buffer;

  constructor(
    private readonly repo: DeliveryReportsRepository,
    @Inject(smsConfig.KEY) sms: ConfigType<typeof smsConfig>,
  ) {
    const secret = sms.deliveryReportSecret;
    this.secret = secret ? Buffer.from(secret) : undefined;
  }

  async record(
    presentedSecret: string | undefined,
    dto: DeliveryReportDto,
  ): Promise<void> {
    if (!this.isAuthorized(presentedSecret))
      throw new UnauthorizedException('Invalid delivery report secret');
    const matched = await this.repo.applyReport(
      dto.providerMessageId,
      dto.status,
      dto.error,
    );
    if (!matched)
      throw new NotFoundException(`Unknown message ${dto.providerMessageId}`);
  }

  private isAuthorized(presented: string | undefined): boolean {
    if (!this.secret || !presented) return false;
    const given = Buffer.from(presented);
    return (
      given.length === this.secret.length && timingSafeEqual(given, this.secret)
    );
  }
}
