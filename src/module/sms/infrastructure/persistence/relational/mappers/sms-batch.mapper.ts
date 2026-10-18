import type { NewSmsBatch, SmsBatch } from '../../../../domain/sms-batch';
import { SmsBatchEntity } from '../entities/sms-batch.entity';

/** Converts between the `SmsBatch` domain type and its TypeORM row. */
export class SmsBatchMapper {
  static toDomain(entity: SmsBatchEntity): SmsBatch {
    return {
      id: entity.id,
      institutionId: entity.institutionId,
      purpose: entity.purpose,
      status: entity.status,
      templateKey: entity.templateKey,
      body: entity.body,
      dedupeKey: entity.dedupeKey,
      recipientCount: entity.recipientCount,
      segmentCount: entity.segmentCount,
      costPaisa: entity.costPaisa,
      sentCount: entity.sentCount,
      failedCount: entity.failedCount,
      createdBy: entity.createdBy,
      sentBy: entity.sentBy,
      sentAt: entity.sentAt,
      createdAt: entity.createdAt,
    };
  }

  static toPersistence(data: NewSmsBatch): SmsBatchEntity {
    const entity = new SmsBatchEntity();
    entity.institutionId = data.institutionId;
    entity.purpose = data.purpose;
    entity.templateKey = data.templateKey;
    entity.body = data.body;
    entity.dedupeKey = data.dedupeKey;
    entity.recipientCount = data.recipientCount;
    entity.segmentCount = data.segmentCount;
    entity.costPaisa = data.costPaisa;
    entity.createdBy = data.createdBy;
    return entity;
  }
}
