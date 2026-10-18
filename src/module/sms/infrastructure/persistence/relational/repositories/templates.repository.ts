import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@common/services/database/database.service';
import type {
  NewSmsTemplate,
  SmsTemplate,
} from '../../../../domain/sms-template';
import { TemplatesRepository } from '../../../../application/ports/templates.repository.port';
import {
  SmsTemplateEntity,
  TEMPLATE_KEY_CONFLICT,
} from '../entities/sms-template.entity';
import { SmsTemplateMapper } from '../mappers/sms-template.mapper';

@Injectable()
export class TemplatesRelationalRepository implements TemplatesRepository {
  constructor(private readonly db: DatabaseService) {}

  async findAll(): Promise<SmsTemplate[]> {
    const rows = await this.db.tenant((m) =>
      m.find(SmsTemplateEntity, { order: { key: 'ASC' } }),
    );
    return rows.map((row) => SmsTemplateMapper.toDomain(row));
  }

  async findByKey(key: string): Promise<SmsTemplate | undefined> {
    const row = await this.db.tenant((m) =>
      m.findOneBy(SmsTemplateEntity, { key }),
    );
    return row ? SmsTemplateMapper.toDomain(row) : undefined;
  }

  upsert(data: NewSmsTemplate): Promise<SmsTemplate> {
    return this.db.tenant(async (m) => {
      await m.upsert(SmsTemplateEntity, data, TEMPLATE_KEY_CONFLICT);
      const row = await m.findOneByOrFail(SmsTemplateEntity, {
        institutionId: data.institutionId,
        key: data.key,
      });
      return SmsTemplateMapper.toDomain(row);
    });
  }

  async remove(key: string): Promise<boolean> {
    const { affected } = await this.db.tenant((m) =>
      m.delete(SmsTemplateEntity, { key }),
    );
    return !!affected;
  }
}
