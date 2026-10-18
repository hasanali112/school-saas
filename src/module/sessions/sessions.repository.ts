import { Injectable } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import { DatabaseService, Tx } from '@database/database.service';
import {
  AcademicSessionRow,
  academicSessions,
  NewAcademicSessionRow,
} from '@database/schema';

@Injectable()
export class SessionsRepository {
  constructor(private readonly database: DatabaseService) {}

  /** If the new session is current, the previous current one is cleared in the same transaction. */
  insert(data: NewAcademicSessionRow): Promise<AcademicSessionRow> {
    return this.database.tenant(async (tx) => {
      if (data.isCurrent) await this.clearCurrent(tx);
      const [row] = await tx.insert(academicSessions).values(data).returning();
      return row;
    });
  }

  findAll(): Promise<AcademicSessionRow[]> {
    return this.database.tenant((tx) =>
      tx
        .select()
        .from(academicSessions)
        .orderBy(desc(academicSessions.startsOn)),
    );
  }

  findById(id: string): Promise<AcademicSessionRow | undefined> {
    return this.database.tenant((tx) =>
      tx.query.academicSessions.findFirst({
        where: eq(academicSessions.id, id),
      }),
    );
  }

  findCurrentId(): Promise<string | undefined> {
    return this.database.tenant(async (tx) => {
      const [row] = await tx
        .select({ id: academicSessions.id })
        .from(academicSessions)
        .where(eq(academicSessions.isCurrent, true))
        .limit(1);
      return row?.id;
    });
  }

  setCurrent(id: string): Promise<AcademicSessionRow | undefined> {
    return this.database.tenant(async (tx) => {
      await this.clearCurrent(tx);
      const [row] = await tx
        .update(academicSessions)
        .set({ isCurrent: true })
        .where(eq(academicSessions.id, id))
        .returning();
      return row;
    });
  }

  private clearCurrent(tx: Tx): Promise<unknown> {
    return tx
      .update(academicSessions)
      .set({ isCurrent: false })
      .where(eq(academicSessions.isCurrent, true));
  }
}
