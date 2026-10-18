import { Injectable } from '@nestjs/common';
import { count, eq } from 'drizzle-orm';
import { Page } from '@common/types/paginated';
import { DatabaseService } from '@database/database.service';
import { NewUserRow, UserRow, users } from '@database/schema';

@Injectable()
export class UsersRepository {
  constructor(private readonly database: DatabaseService) {}

  insert(data: NewUserRow): Promise<UserRow> {
    return this.database.tenant(async (tx) => {
      const [row] = await tx.insert(users).values(data).returning();
      return row;
    });
  }

  findById(id: string): Promise<UserRow | undefined> {
    return this.database.tenant((tx) =>
      tx.query.users.findFirst({ where: eq(users.id, id) }),
    );
  }

  findPage(offset: number, limit: number): Promise<Page<UserRow>> {
    return this.database.tenant(async (tx) => {
      const [rows, [{ total }]] = await Promise.all([
        tx.select().from(users).orderBy(users.name).limit(limit).offset(offset),
        tx.select({ total: count() }).from(users),
      ]);
      return { rows, total };
    });
  }
}
