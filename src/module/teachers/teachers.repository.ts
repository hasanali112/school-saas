import { Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DatabaseService } from '@database/database.service';
import {
  NewSectionClassTeacherRow,
  NewTeacherAssignmentRow,
  SectionClassTeacherRow,
  sectionClassTeachers,
  TeacherAssignmentRow,
  teacherAssignments,
  users,
} from '@database/schema';

export interface SectionTeachers {
  classTeacher: SectionClassTeacherRow | undefined;
  subjectTeachers: TeacherAssignmentRow[];
}

export interface TeacherWorkload {
  classTeacherOf: SectionClassTeacherRow[];
  subjectAssignments: TeacherAssignmentRow[];
}

@Injectable()
export class TeachersRepository {
  constructor(private readonly database: DatabaseService) {}

  /** Roles of a user in this tenant, or undefined if the id is not one of ours (RLS). */
  findUserRoles(userId: string): Promise<string[] | undefined> {
    return this.database.tenant(async (tx) => {
      const [row] = await tx
        .select({ roles: users.roles })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      return row?.roles;
    });
  }

  /** Upsert: reassigning a subject in a section replaces the previous teacher. */
  upsertAssignment(
    data: NewTeacherAssignmentRow,
  ): Promise<TeacherAssignmentRow> {
    return this.database.tenant(async (tx) => {
      const [row] = await tx
        .insert(teacherAssignments)
        .values(data)
        .onConflictDoUpdate({
          target: [
            teacherAssignments.institutionId,
            teacherAssignments.sessionId,
            teacherAssignments.sectionId,
            teacherAssignments.subjectId,
          ],
          set: { teacherUserId: data.teacherUserId },
        })
        .returning();
      return row;
    });
  }

  removeAssignment(sectionId: string, assignmentId: string): Promise<boolean> {
    return this.database.tenant(async (tx) => {
      const deleted = await tx
        .delete(teacherAssignments)
        .where(
          and(
            eq(teacherAssignments.id, assignmentId),
            eq(teacherAssignments.sectionId, sectionId),
          ),
        )
        .returning({ id: teacherAssignments.id });
      return deleted.length > 0;
    });
  }

  upsertClassTeacher(
    data: NewSectionClassTeacherRow,
  ): Promise<SectionClassTeacherRow> {
    return this.database.tenant(async (tx) => {
      const [row] = await tx
        .insert(sectionClassTeachers)
        .values(data)
        .onConflictDoUpdate({
          target: [
            sectionClassTeachers.institutionId,
            sectionClassTeachers.sessionId,
            sectionClassTeachers.sectionId,
          ],
          set: { teacherUserId: data.teacherUserId },
        })
        .returning();
      return row;
    });
  }

  findForSection(
    sectionId: string,
    sessionId: string,
  ): Promise<SectionTeachers> {
    return this.database.tenant(async (tx) => {
      const [[classTeacher], subjectTeachers] = await Promise.all([
        tx
          .select()
          .from(sectionClassTeachers)
          .where(
            and(
              eq(sectionClassTeachers.sectionId, sectionId),
              eq(sectionClassTeachers.sessionId, sessionId),
            ),
          )
          .limit(1),
        tx
          .select()
          .from(teacherAssignments)
          .where(
            and(
              eq(teacherAssignments.sectionId, sectionId),
              eq(teacherAssignments.sessionId, sessionId),
            ),
          ),
      ]);
      return { classTeacher, subjectTeachers };
    });
  }

  findForTeacher(
    teacherUserId: string,
    sessionId: string,
  ): Promise<TeacherWorkload> {
    return this.database.tenant(async (tx) => {
      const [classTeacherOf, subjectAssignments] = await Promise.all([
        tx
          .select()
          .from(sectionClassTeachers)
          .where(
            and(
              eq(sectionClassTeachers.teacherUserId, teacherUserId),
              eq(sectionClassTeachers.sessionId, sessionId),
            ),
          ),
        tx
          .select()
          .from(teacherAssignments)
          .where(
            and(
              eq(teacherAssignments.teacherUserId, teacherUserId),
              eq(teacherAssignments.sessionId, sessionId),
            ),
          ),
      ]);
      return { classTeacherOf, subjectAssignments };
    });
  }
}
