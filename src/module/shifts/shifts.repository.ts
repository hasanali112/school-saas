import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@database/database.service';
import { NewShiftRow, ShiftRow, shifts } from '@database/schema';

@Injectable()
export class ShiftsRepository {
  constructor(private readonly database: DatabaseService) {}

  insert(data: NewShiftRow): Promise<ShiftRow> {
    return this.database.tenant(async (tx) => {
      const [row] = await tx.insert(shifts).values(data).returning();
      return row;
    });
  }

  findAll(): Promise<ShiftRow[]> {
    return this.database.tenant((tx) =>
      tx.select().from(shifts).orderBy(shifts.name),
    );
  }
}
