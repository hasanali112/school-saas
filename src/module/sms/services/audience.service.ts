import { Injectable } from '@nestjs/common';
import type {
  AudienceSelection,
  GuardianRecipient,
  Recipient,
  ResolvedAudience,
  StaffRecipient,
} from '../domain/audience';
import { AudienceRepository } from '../application/ports/audience.repository.port';

/**
 * Audience builder (F1-12 §2): class, section, explicit students, staff roles or
 * ad-hoc phones. Guardians are the primary guardian per student and must have SMS
 * consent (F1-15); staff and ad-hoc numbers carry no consent requirement.
 */
@Injectable()
export class AudienceService {
  constructor(private readonly repo: AudienceRepository) {}

  async resolve(
    selection: AudienceSelection,
    sessionId: string,
  ): Promise<ResolvedAudience> {
    const wantsGuardians =
      selection.classId || selection.sectionId || selection.studentIds;
    const [guardianRows, staffRows] = await Promise.all([
      wantsGuardians
        ? this.repo.findGuardianRecipients({
            sessionId,
            classId: selection.classId,
            sectionId: selection.sectionId,
            studentIds: selection.studentIds,
          })
        : Promise.resolve<GuardianRecipient[]>([]),
      selection.roles?.length
        ? this.repo.findStaffRecipients(selection.roles)
        : Promise.resolve<StaffRecipient[]>([]),
    ]);

    const consented = guardianRows.filter((row) => row.smsConsent === true);
    const recipients: Recipient[] = [
      ...consented.map((row) => this.toGuardianRecipient(row)),
      ...staffRows.map((row) => ({
        phone: row.phone,
        userId: row.userId,
        fields: { name: row.name },
      })),
      ...(selection.phones ?? []).map((phone) => ({ phone, fields: {} })),
    ];
    return {
      recipients,
      excluded: { noConsent: guardianRows.length - consented.length },
    };
  }

  private toGuardianRecipient(row: GuardianRecipient): Recipient {
    return {
      phone: row.phone,
      guardianId: row.guardianId,
      studentId: row.studentId,
      fields: {
        studentName: row.studentNameBn,
        studentNameEn: row.studentNameEn,
        guardianName: row.guardianName,
        className: row.className,
        sectionName: row.sectionName,
        rollNo: String(row.rollNo),
      },
    };
  }
}
