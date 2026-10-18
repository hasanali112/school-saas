import { Injectable } from '@nestjs/common';
import { DeliveryReportDto } from '../dto/delivery-report.dto';
import { DeliveryReportsService } from './delivery-reports.service';

@Injectable()
export class DeliveryReportsFacade {
  constructor(private readonly reports: DeliveryReportsService) {}

  record(secret: string | undefined, dto: DeliveryReportDto): Promise<void> {
    return this.reports.record(secret, dto);
  }
}
