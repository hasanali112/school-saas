import { Injectable } from '@nestjs/common';
import { asc } from 'drizzle-orm';
import { DatabaseService } from '@database/database.service';
import {
  classes,
  ClassRow,
  NewClassRow,
  NewSectionRow,
  SectionRow,
  sections,
} from '@database/schema';

export interface ClassesWithSections {
  classRows: ClassRow[];
  sectionRows: SectionRow[];
}

@Injectable()
export class ClassesRepository {
  constructor(private readonly database: DatabaseService) {}

  insertClass(data: NewClassRow): Promise<ClassRow> {
    return this.database.tenant(async (tx) => {
      const [row] = await tx.insert(classes).values(data).returning();
      return row;
    });
  }

  insertSection(data: NewSectionRow): Promise<SectionRow> {
    return this.database.tenant(async (tx) => {
      const [row] = await tx.insert(sections).values(data).returning();
      return row;
    });
  }

  /** Two bounded queries (classes, all sections) instead of one per class. */
  findAllWithSections(): Promise<ClassesWithSections> {
    return this.database.tenant(async (tx) => {
      const [classRows, sectionRows] = await Promise.all([
        tx.select().from(classes).orderBy(asc(classes.ordinal)),
        tx.select().from(sections).orderBy(asc(sections.name)),
      ]);
      return { classRows, sectionRows };
    });
  }
}
