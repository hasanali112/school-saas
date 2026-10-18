import { Injectable } from '@nestjs/common';
import { and, asc, eq } from 'drizzle-orm';
import { DatabaseService } from '@database/database.service';
import {
  classSubjects,
  EnrolmentRow,
  enrolments,
  NewEnrolmentRow,
  sections,
  StudentRow,
  students,
  subjects,
} from '@database/schema';

export interface OfferedSubject {
  subjectId: string;
  role: 'compulsory' | 'fourth_optional' | 'religion';
  religion: StudentRow['religion'];
}

export interface RosterRow {
  enrolment: EnrolmentRow;
  student: StudentRow;
}

@Injectable()
export class EnrolmentsRepository {
  constructor(private readonly database: DatabaseService) {}

  /** Subjects offered in the class a section belongs to; empty if the section is unknown (or not ours). */
  findOfferedSubjects(sectionId: string): Promise<OfferedSubject[]> {
    return this.database.tenant((tx) =>
      tx
        .select({
          subjectId: classSubjects.subjectId,
          role: classSubjects.role,
          religion: subjects.religion,
        })
        .from(sections)
        .innerJoin(classSubjects, eq(classSubjects.classId, sections.classId))
        .innerJoin(subjects, eq(subjects.id, classSubjects.subjectId))
        .where(eq(sections.id, sectionId)),
    );
  }

  insert(data: NewEnrolmentRow): Promise<EnrolmentRow> {
    return this.database.tenant(async (tx) => {
      const [row] = await tx.insert(enrolments).values(data).returning();
      return row;
    });
  }

  findByStudent(studentId: string): Promise<EnrolmentRow[]> {
    return this.database.tenant((tx) =>
      tx
        .select()
        .from(enrolments)
        .where(eq(enrolments.studentId, studentId))
        .orderBy(asc(enrolments.createdAt)),
    );
  }

  /** One join ordered by roll; the shape attendance and marks entry render directly. */
  findRoster(sectionId: string, sessionId: string): Promise<RosterRow[]> {
    return this.database.tenant((tx) =>
      tx
        .select({ enrolment: enrolments, student: students })
        .from(enrolments)
        .innerJoin(students, eq(students.id, enrolments.studentId))
        .where(
          and(
            eq(enrolments.sectionId, sectionId),
            eq(enrolments.sessionId, sessionId),
          ),
        )
        .orderBy(asc(enrolments.rollNo)),
    );
  }
}
