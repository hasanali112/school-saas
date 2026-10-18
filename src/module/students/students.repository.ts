import { Injectable } from '@nestjs/common';
import { and, count, eq, ilike, or, SQL } from 'drizzle-orm';
import { Page } from '@common/types/paginated';
import { DatabaseService } from '@database/database.service';
import { NewStudentRow, StudentRow, students } from '@database/schema';

export interface StudentFilter {
  search?: string;
  status?: StudentRow['status'];
}

/** The only file in this module that knows SQL. RLS scopes every query to the tenant. */
@Injectable()
export class StudentsRepository {
  constructor(private readonly database: DatabaseService) {}

  insert(data: NewStudentRow): Promise<StudentRow> {
    return this.database.tenant(async (tx) => {
      const [row] = await tx.insert(students).values(data).returning();
      return row;
    });
  }

  findById(id: string): Promise<StudentRow | undefined> {
    return this.database.tenant((tx) =>
      tx.query.students.findFirst({ where: eq(students.id, id) }),
    );
  }

  update(
    id: string,
    patch: Partial<StudentRow>,
  ): Promise<StudentRow | undefined> {
    return this.database.tenant(async (tx) => {
      const [row] = await tx
        .update(students)
        .set(patch)
        .where(eq(students.id, id))
        .returning();
      return row;
    });
  }

  findPage(
    offset: number,
    limit: number,
    filter: StudentFilter,
  ): Promise<Page<StudentRow>> {
    const where = this.buildWhere(filter);
    return this.database.tenant(async (tx) => {
      // Count and page run in parallel on the same transaction: one round trip of latency, not two.
      const [rows, [{ total }]] = await Promise.all([
        tx
          .select()
          .from(students)
          .where(where)
          .orderBy(students.nameEn)
          .limit(limit)
          .offset(offset),
        tx.select({ total: count() }).from(students).where(where),
      ]);
      return { rows, total };
    });
  }

  private buildWhere({ search, status }: StudentFilter): SQL | undefined {
    const clauses: SQL[] = [];
    if (status) clauses.push(eq(students.status, status));
    if (search) {
      const pattern = `%${search}%`;
      clauses.push(
        or(
          ilike(students.nameEn, pattern),
          ilike(students.nameBn, pattern),
          ilike(students.admissionNo, pattern),
        )!,
      );
    }
    return clauses.length ? and(...clauses) : undefined;
  }
}
