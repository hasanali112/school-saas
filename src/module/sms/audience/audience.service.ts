import { Injectable } from '@nestjs/common';
import { AudienceDto } from '../dto/audience.dto';
import { MergeValues } from '../templates/template-render';
import {
  AudienceRepository,
  GuardianRecipientRow,
  StaffRecipientRow,
} from './audience.repository';

export interface Recipient {
  phone: string;
  guardianId?: string;
  studentId?: string;
  userId?: string;
  /** Per-recipient merge values; the composer adds the shared ones (date, institution). */
  fields: MergeValues;
}

/** Recipients dropped by the builder, by reason, so the preview can show them. */
export interface AudienceExclusions {
  noConsent: number;
}

export interface ResolvedAudience {
  recipients: Recipient[];
  excluded: AudienceExclusions;
}

/**
 * Audience builder (F1-12 §2): class, section, explicit students, staff roles or
 * ad-hoc phones. Guardians are the primary guardian per student and must have SMS
 * consent (F1-15); staff and ad-hoc numbers carry no consent requirement.
 */
@Injectable()
export class AudienceService {
  constructor(private readonly repo: AudienceRepository) {}

  async resolve(
    dto: AudienceDto,
    sessionId: string,
  ): Promise<ResolvedAudience> {
    const wantsGuardians = dto.classId || dto.sectionId || dto.studentIds;
    const [guardianRows, staffRows] = await Promise.all([
      wantsGuardians
        ? this.repo.findGuardianRecipients({
            sessionId,
            classId: dto.classId,
            sectionId: dto.sectionId,
            studentIds: dto.studentIds,
          })
        : Promise.resolve<GuardianRecipientRow[]>([]),
      dto.roles?.length
        ? this.repo.findStaffRecipients(dto.roles)
        : Promise.resolve<StaffRecipientRow[]>([]),
    ]);

    const consented = guardianRows.filter((row) => row.smsConsent === true);
    const recipients: Recipient[] = [
      ...consented.map((row) => this.toGuardianRecipient(row)),
      ...staffRows.map((row) => ({
        phone: row.phone,
        userId: row.userId,
        fields: { name: row.name },
      })),
      ...(dto.phones ?? []).map((phone) => ({ phone, fields: {} })),
    ];
    return {
      recipients,
      excluded: { noConsent: guardianRows.length - consented.length },
    };
  }

  private toGuardianRecipient(row: GuardianRecipientRow): Recipient {
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
