import { Injectable } from '@nestjs/common';
import { and, eq, ne } from 'drizzle-orm';
import { DatabaseService } from '@database/database.service';
import {
  GuardianRow,
  guardians,
  StudentGuardianRow,
  studentGuardians,
  StudentRow,
  students,
} from '@database/schema';

export interface LinkInput {
  institutionId: string;
  studentId: string;
  phone: string;
  name: string;
  relation: StudentGuardianRow['relation'];
  isPrimary: boolean;
}

export interface LinkedGuardian {
  link: StudentGuardianRow;
  guardian: GuardianRow;
}

export interface GuardianChild {
  link: StudentGuardianRow;
  student: StudentRow;
}

@Injectable()
export class GuardiansRepository {
  constructor(private readonly database: DatabaseService) {}

  /**
   * Upsert the guardian by phone, link, and keep at most one primary per student,
   * all in one transaction so a failed link never leaves a dangling guardian.
   */
  link(input: LinkInput): Promise<LinkedGuardian> {
    return this.database.tenant(async (tx) => {
      const [guardian] = await tx
        .insert(guardians)
        .values({
          institutionId: input.institutionId,
          phone: input.phone,
          name: input.name,
        })
        .onConflictDoUpdate({
          target: [guardians.institutionId, guardians.phone],
          set: { name: input.name },
        })
        .returning();

      const [link] = await tx
        .insert(studentGuardians)
        .values({
          institutionId: input.institutionId,
          studentId: input.studentId,
          guardianId: guardian.id,
          relation: input.relation,
          isPrimary: input.isPrimary,
        })
        .returning();

      if (input.isPrimary) {
        await tx
          .update(studentGuardians)
          .set({ isPrimary: false })
          .where(
            and(
              eq(studentGuardians.studentId, input.studentId),
              ne(studentGuardians.id, link.id),
            ),
          );
      }
      return { link, guardian };
    });
  }

  unlink(studentId: string, guardianId: string): Promise<boolean> {
    return this.database.tenant(async (tx) => {
      const deleted = await tx
        .delete(studentGuardians)
        .where(
          and(
            eq(studentGuardians.studentId, studentId),
            eq(studentGuardians.guardianId, guardianId),
          ),
        )
        .returning({ id: studentGuardians.id });
      return deleted.length > 0;
    });
  }

  findForStudent(studentId: string): Promise<LinkedGuardian[]> {
    return this.database.tenant((tx) =>
      tx
        .select({ link: studentGuardians, guardian: guardians })
        .from(studentGuardians)
        .innerJoin(guardians, eq(guardians.id, studentGuardians.guardianId))
        .where(eq(studentGuardians.studentId, studentId)),
    );
  }

  findChildren(guardianId: string): Promise<GuardianChild[]> {
    return this.database.tenant((tx) =>
      tx
        .select({ link: studentGuardians, student: students })
        .from(studentGuardians)
        .innerJoin(students, eq(students.id, studentGuardians.studentId))
        .where(eq(studentGuardians.guardianId, guardianId)),
    );
  }
}
