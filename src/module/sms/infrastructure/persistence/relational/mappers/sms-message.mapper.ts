import type { SmsMessage } from '../../../../domain/sms-batch';
import { SmsMessageEntity } from '../entities/sms-message.entity';

/** Converts between the `SmsMessage` domain type and its TypeORM row. */
export class SmsMessageMapper {
  static toDomain(entity: SmsMessageEntity): SmsMessage {
    return {
      id: entity.id,
      institutionId: entity.institutionId,
      batchId: entity.batchId,
      guardianId: entity.guardianId,
      studentId: entity.studentId,
      phone: entity.phone,
      body: entity.body,
      segments: entity.segments,
      costPaisa: entity.costPaisa,
      status: entity.status,
      gateway: entity.gateway,
      providerMessageId: entity.providerMessageId,
      error: entity.error,
      sentAt: entity.sentAt,
      deliveredAt: entity.deliveredAt,
      createdAt: entity.createdAt,
    };
  }
}
