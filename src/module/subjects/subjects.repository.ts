import { Injectable } from '@nestjs/common';
import { and, asc, eq } from 'drizzle-orm';
import { DatabaseService } from '@database/database.service';
import {
  ClassSubjectRow,
  classSubjects,
  NewClassSubjectRow,
  NewSubjectRow,
  SubjectRow,
  subjects,
} from '@database/schema';

export interface ClassSubjectWithSubject {
  link: ClassSubjectRow;
  subject: SubjectRow;
}

@Injectable()
export class SubjectsRepository {
  constructor(private readonly database: DatabaseService) {}

  insert(data: NewSubjectRow): Promise<SubjectRow> {
    return this.database.tenant(async (tx) => {
      const [row] = await tx.insert(subjects).values(data).returning();
      return row;
    });
  }

  findAll(): Promise<SubjectRow[]> {
    return this.database.tenant((tx) =>
      tx.select().from(subjects).orderBy(asc(subjects.code)),
    );
  }

  findById(id: string): Promise<SubjectRow | undefined> {
    return this.database.tenant((tx) =>
      tx.query.subjects.findFirst({ where: eq(subjects.id, id) }),
    );
  }

  attachToClass(data: NewClassSubjectRow): Promise<ClassSubjectRow> {
    return this.database.tenant(async (tx) => {
      const [row] = await tx.insert(classSubjects).values(data).returning();
      return row;
    });
  }

  detachFromClass(classId: string, subjectId: string): Promise<boolean> {
    return this.database.tenant(async (tx) => {
      const deleted = await tx
        .delete(classSubjects)
        .where(
          and(
            eq(classSubjects.classId, classId),
            eq(classSubjects.subjectId, subjectId),
          ),
        )
        .returning({ id: classSubjects.id });
      return deleted.length > 0;
    });
  }

  /** One join, ordered by subject code; no per-subject lookups. */
  findByClass(classId: string): Promise<ClassSubjectWithSubject[]> {
    return this.database.tenant((tx) =>
      tx
        .select({ link: classSubjects, subject: subjects })
        .from(classSubjects)
        .innerJoin(subjects, eq(subjects.id, classSubjects.subjectId))
        .where(eq(classSubjects.classId, classId))
        .orderBy(asc(subjects.code)),
    );
  }
}
