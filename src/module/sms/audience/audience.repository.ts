import { Injectable } from '@nestjs/common';
import { and, arrayOverlaps, eq, inArray, SQL } from 'drizzle-orm';
import { Role } from '@modules/auth/roles';
import { DatabaseService } from '@database/database.service';
import {
  classes,
  consents,
  enrolments,
  guardians,
  sections,
  studentGuardians,
  students,
  users,
} from '@database/schema';

export interface GuardianFilter {
  sessionId: string;
  classId?: string;
  sectionId?: string;
  studentIds?: string[];
}

export interface GuardianRecipientRow {
  studentId: string;
  studentNameBn: string;
  studentNameEn: string;
  rollNo: number;
  className: string;
  sectionName: string;
  guardianId: string;
  guardianName: string;
  phone: string;
  /** Null when the guardian has never been asked. */
  smsConsent: boolean | null;
}

export interface StaffRecipientRow {
  userId: string;
  name: string;
  phone: string;
}

@Injectable()
export class AudienceRepository {
  constructor(private readonly database: DatabaseService) {}

  /**
   * Primary guardian of every active student matching the filter, with their SMS
   * consent joined in, in one query. The service decides what to do with consent.
   */
  findGuardianRecipients(
    filter: GuardianFilter,
  ): Promise<GuardianRecipientRow[]> {
    const clauses: SQL[] = [
      eq(enrolments.sessionId, filter.sessionId),
      eq(students.status, 'active'),
      eq(studentGuardians.isPrimary, true),
    ];
    if (filter.sectionId)
      clauses.push(eq(enrolments.sectionId, filter.sectionId));
    if (filter.classId) clauses.push(eq(sections.classId, filter.classId));
    if (filter.studentIds)
      clauses.push(inArray(enrolments.studentId, [...filter.studentIds]));

    return this.database.tenant((tx) =>
      tx
        .select({
          studentId: students.id,
          studentNameBn: students.nameBn,
          studentNameEn: students.nameEn,
          rollNo: enrolments.rollNo,
          className: classes.name,
          sectionName: sections.name,
          guardianId: guardians.id,
          guardianName: guardians.name,
          phone: guardians.phone,
          smsConsent: consents.granted,
        })
        .from(enrolments)
        .innerJoin(students, eq(students.id, enrolments.studentId))
        .innerJoin(sections, eq(sections.id, enrolments.sectionId))
        .innerJoin(classes, eq(classes.id, sections.classId))
        .innerJoin(
          studentGuardians,
          eq(studentGuardians.studentId, students.id),
        )
        .innerJoin(guardians, eq(guardians.id, studentGuardians.guardianId))
        .leftJoin(
          consents,
          and(
            eq(consents.guardianId, guardians.id),
            eq(consents.purpose, 'sms'),
          ),
        )
        .where(and(...clauses))
        .orderBy(classes.ordinal, sections.name, enrolments.rollNo),
    );
  }

  findStaffRecipients(roles: readonly Role[]): Promise<StaffRecipientRow[]> {
    return this.database.tenant((tx) =>
      tx
        .select({ userId: users.id, name: users.name, phone: users.phone })
        .from(users)
        .where(
          and(
            eq(users.status, 'active'),
            arrayOverlaps(users.roles, [...roles]),
          ),
        )
        .orderBy(users.name),
    );
  }
}
