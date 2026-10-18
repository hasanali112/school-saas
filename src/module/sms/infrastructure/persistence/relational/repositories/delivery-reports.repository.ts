import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@common/services/database/database.service';
import { DeliveryStatus, SmsMessageStatus } from '../../../../domain/sms';
import { DeliveryReportsRepository } from '../../../../application/ports/delivery-reports.repository.port';
import { SmsMessageEntity } from '../entities/sms-message.entity';

@Injectable()
export class DeliveryReportsRelationalRepository implements DeliveryReportsRepository {
  constructor(private readonly db: DatabaseService) {}

  async applyReport(
    providerMessageId: string,
    status: DeliveryStatus,
    error?: string,
  ): Promise<boolean> {
    const delivered = status === DeliveryStatus.Delivered;
    const { affected } = await this.db.system((m) =>
      m.update(
        SmsMessageEntity,
        { providerMessageId },
        {
          status: delivered
            ? SmsMessageStatus.Delivered
            : SmsMessageStatus.Failed,
          error: error ?? null,
          deliveredAt: delivered ? new Date() : null,
        },
      ),
    );
    return !!affected;
  }
}
