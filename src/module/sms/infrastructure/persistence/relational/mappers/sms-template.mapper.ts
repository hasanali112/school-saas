import type {
  NewSmsTemplate,
  SmsTemplate,
} from '../../../../domain/sms-template';
import { SmsTemplateEntity } from '../entities/sms-template.entity';

/** Converts between the `SmsTemplate` domain type and its TypeORM row. */
export class SmsTemplateMapper {
  static toDomain(entity: SmsTemplateEntity): SmsTemplate {
    return {
      id: entity.id,
      institutionId: entity.institutionId,
      key: entity.key,
      name: entity.name,
      body: entity.body,
      updatedBy: entity.updatedBy,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toPersistence(data: NewSmsTemplate): SmsTemplateEntity {
    const entity = new SmsTemplateEntity();
    entity.institutionId = data.institutionId;
    entity.key = data.key;
    entity.name = data.name;
    entity.body = data.body;
    entity.updatedBy = data.updatedBy;
    return entity;
  }
}
