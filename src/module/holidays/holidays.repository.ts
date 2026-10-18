import { Injectable } from '@nestjs/common';
import { and, asc, eq, gte, lte } from 'drizzle-orm';
import { DatabaseService } from '@database/database.service';
import { HolidayRow, holidays, NewHolidayRow } from '@database/schema';

@Injectable()
export class HolidaysRepository {
  constructor(private readonly database: DatabaseService) {}

  insert(data: NewHolidayRow): Promise<HolidayRow> {
    return this.database.tenant(async (tx) => {
      const [row] = await tx.insert(holidays).values(data).returning();
      return row;
    });
  }

  findBetween(from: string, to: string): Promise<HolidayRow[]> {
    return this.database.tenant((tx) =>
      tx
        .select()
        .from(holidays)
        .where(and(gte(holidays.date, from), lte(holidays.date, to)))
        .orderBy(asc(holidays.date)),
    );
  }

  /** Used by attendance to block entry on holidays. */
  existsOn(date: string): Promise<boolean> {
    return this.database.tenant(async (tx) => {
      const [row] = await tx
        .select({ id: holidays.id })
        .from(holidays)
        .where(eq(holidays.date, date))
        .limit(1);
      return !!row;
    });
  }

  remove(id: string): Promise<boolean> {
    return this.database.tenant(async (tx) => {
      const deleted = await tx
        .delete(holidays)
        .where(eq(holidays.id, id))
        .returning({ id: holidays.id });
      return deleted.length > 0;
    });
  }
}
