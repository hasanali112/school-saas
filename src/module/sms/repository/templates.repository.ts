import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@common/services/database/database.service';
import type { NewSmsTemplate, SmsTemplate } from '../domain/sms-template';
import { TemplatesRepositoryPort } from '../port/templates.repository.port';
import {
  SmsTemplateEntity,
  TEMPLATE_KEY_CONFLICT,
} from './entities/sms-template.entity';

@Injectable()
export class TemplatesRepository implements TemplatesRepositoryPort {
  constructor(private readonly db: DatabaseService) {}

  findAll(): Promise<SmsTemplate[]> {
    return this.db.tenant((m) =>
      m.find(SmsTemplateEntity, { order: { key: 'ASC' } }),
    );
  }

  async findByKey(key: string): Promise<SmsTemplate | undefined> {
    return (
      (await this.db.tenant((m) => m.findOneBy(SmsTemplateEntity, { key }))) ??
      undefined
    );
  }

  upsert(data: NewSmsTemplate): Promise<SmsTemplate> {
    return this.db.tenant(async (m) => {
      await m.upsert(SmsTemplateEntity, data, TEMPLATE_KEY_CONFLICT);
      return m.findOneByOrFail(SmsTemplateEntity, {
        institutionId: data.institutionId,
        key: data.key,
      });
    });
  }

  async remove(key: string): Promise<boolean> {
    const { affected } = await this.db.tenant((m) =>
      m.delete(SmsTemplateEntity, { key }),
    );
    return !!affected;
  }
}
