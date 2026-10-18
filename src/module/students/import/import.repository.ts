import { Injectable } from '@nestjs/common';
import { eq, inArray } from 'drizzle-orm';
import { DatabaseService } from '@database/database.service';
import {
  classes,
  enrolments,
  guardians,
  NewStudentRow,
  sections,
  studentGuardians,
  students,
} from '@database/schema';

export interface SectionRef {
  sectionId: string;
  classId: string;
}

export interface ImportRecord {
  student: Omit<NewStudentRow, 'institutionId'>;
  sectionId: string;
  rollNo: number;
  guardian?: {
    phone: string;
    name: string;
    relation: 'father' | 'mother' | 'other';
  };
}

export interface ExistingRefs {
  admissionNos: Set<string>;
  takenRolls: Set<string>;
}

const rollKey = (sectionId: string, rollNo: number): string =>
  `${sectionId}:${rollNo}`;

@Injectable()
export class ImportRepository {
  constructor(private readonly database: DatabaseService) {}

  /** "Six/A" → section, built once per import; no per-row lookups. */
  findSectionMap(): Promise<Map<string, SectionRef>> {
    return this.database.tenant(async (tx) => {
      const rows = await tx
        .select({
          className: classes.name,
          sectionName: sections.name,
          sectionId: sections.id,
          classId: classes.id,
        })
        .from(sections)
        .innerJoin(classes, eq(classes.id, sections.classId));
      return new Map(
        rows.map((r) => [
          sectionKey(r.className, r.sectionName),
          { sectionId: r.sectionId, classId: r.classId },
        ]),
      );
    });
  }

  /** Two set-based queries so the dry run can report clashes with existing data. */
  findExisting(
    admissionNos: readonly string[],
    sessionId: string,
  ): Promise<ExistingRefs> {
    return this.database.tenant(async (tx) => {
      const [existingStudents, existingEnrolments] = await Promise.all([
        admissionNos.length
          ? tx
              .select({ admissionNo: students.admissionNo })
              .from(students)
              .where(inArray(students.admissionNo, [...admissionNos]))
          : Promise.resolve([] as { admissionNo: string }[]),
        tx
          .select({
            sectionId: enrolments.sectionId,
            rollNo: enrolments.rollNo,
          })
          .from(enrolments)
          .where(eq(enrolments.sessionId, sessionId)),
      ]);
      return {
        admissionNos: new Set(existingStudents.map((r) => r.admissionNo)),
        takenRolls: new Set(
          existingEnrolments.map((r) => rollKey(r.sectionId, r.rollNo)),
        ),
      };
    });
  }

  /** All-or-nothing: four batched statements inside one transaction. */
  importAll(
    institutionId: string,
    sessionId: string,
    records: readonly ImportRecord[],
  ): Promise<number> {
    if (records.length === 0) return Promise.resolve(0);
    return this.database.tenant(async (tx) => {
      const inserted = await tx
        .insert(students)
        .values(records.map((r) => ({ ...r.student, institutionId })))
        .returning({ id: students.id, admissionNo: students.admissionNo });
      const idByAdmission = new Map(inserted.map((s) => [s.admissionNo, s.id]));

      await tx.insert(enrolments).values(
        records.map((r) => ({
          institutionId,
          sessionId,
          sectionId: r.sectionId,
          rollNo: r.rollNo,
          studentId: idByAdmission.get(r.student.admissionNo)!,
        })),
      );

      const withGuardian = records.filter((r) => r.guardian);
      if (withGuardian.length) {
        const uniqueGuardians = new Map(
          withGuardian.map((r) => [r.guardian!.phone, r.guardian!.name]),
        );
        const guardianRows = await tx
          .insert(guardians)
          .values(
            [...uniqueGuardians].map(([phone, name]) => ({
              institutionId,
              phone,
              name,
            })),
          )
          .onConflictDoUpdate({
            target: [guardians.institutionId, guardians.phone],
            set: { name: guardians.name },
          })
          .returning({ id: guardians.id, phone: guardians.phone });
        const guardianIdByPhone = new Map(
          guardianRows.map((g) => [g.phone, g.id]),
        );

        await tx
          .insert(studentGuardians)
          .values(
            withGuardian.map((r) => ({
              institutionId,
              studentId: idByAdmission.get(r.student.admissionNo)!,
              guardianId: guardianIdByPhone.get(r.guardian!.phone)!,
              relation: r.guardian!.relation,
              isPrimary: true,
            })),
          )
          .onConflictDoNothing();
      }
      return inserted.length;
    });
  }
}

export function sectionKey(className: string, sectionName: string): string {
  return `${className.trim().toLowerCase()}/${sectionName.trim().toLowerCase()}`;
}

export { rollKey };
