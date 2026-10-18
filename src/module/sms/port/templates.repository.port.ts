import type { NewSmsTemplate, SmsTemplate } from '../domain/sms-template';

export abstract class TemplatesRepositoryPort {
  abstract findAll(): Promise<SmsTemplate[]>;
  abstract findByKey(key: string): Promise<SmsTemplate | undefined>;
  abstract upsert(data: NewSmsTemplate): Promise<SmsTemplate>;
  abstract remove(key: string): Promise<boolean>;
}
