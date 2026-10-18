import { Injectable } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import { DatabaseService } from '@database/database.service';
import {
  NewSmsTemplateRow,
  SmsTemplateRow,
  smsTemplates,
} from '@database/schema';

@Injectable()
export class TemplatesRepository {
  constructor(private readonly database: DatabaseService) {}

  findAll(): Promise<SmsTemplateRow[]> {
    return this.database.tenant((tx) =>
      tx.select().from(smsTemplates).orderBy(asc(smsTemplates.key)),
    );
  }

  findByKey(key: string): Promise<SmsTemplateRow | undefined> {
    return this.database.tenant((tx) =>
      tx.query.smsTemplates.findFirst({ where: eq(smsTemplates.key, key) }),
    );
  }

  upsert(data: NewSmsTemplateRow): Promise<SmsTemplateRow> {
    return this.database.tenant(async (tx) => {
      const [row] = await tx
        .insert(smsTemplates)
        .values(data)
        .onConflictDoUpdate({
          target: [smsTemplates.institutionId, smsTemplates.key],
          set: {
            name: data.name,
            body: data.body,
            updatedBy: data.updatedBy,
            updatedAt: new Date(),
          },
        })
        .returning();
      return row;
    });
  }

  remove(key: string): Promise<boolean> {
    return this.database.tenant(async (tx) => {
      const deleted = await tx
        .delete(smsTemplates)
        .where(eq(smsTemplates.key, key))
        .returning({ id: smsTemplates.id });
      return deleted.length > 0;
    });
  }
}
