import { BadRequestException, Injectable } from '@nestjs/common';
import { isForeignKeyViolation } from '@common/services/database/database-errors';
import type { AuditSnapshot } from '@module/audit/domain/audit-entry';
import { AuditLogPort } from '@module/audit/application/ports/audit-log.port';
import type { AuthUser } from '@common/types/auth-user';
import type { Consent } from '../domain/consent';
import { CURRENT_NOTICE_VERSION } from '../domain/consent.constants';
import { RecordConsentDto } from '../dto/consent.dto';
import { ConsentResponseDto } from '../dto/consent.response.dto';
import { ConsentRepository } from '../application/ports/consent.repository.port';

/** Minimal F1-15: per-purpose consent so SMS audiences can be filtered from day one. Every change is audited. */
@Injectable()
export class ConsentService {
  constructor(
    private readonly repo: ConsentRepository,
    private readonly audit: AuditLogPort,
  ) {}

  async list(guardianId: string): Promise<ConsentResponseDto[]> {
    return ConsentResponseDto.fromMany(
      await this.repo.findForGuardian(guardianId),
    );
  }

  async record(
    guardianId: string,
    dto: RecordConsentDto,
    actor: AuthUser,
  ): Promise<ConsentResponseDto> {
    const previous = await this.repo.findOne(guardianId, dto.purpose);
    let row: Consent;
    try {
      row = await this.repo.upsert({
        institutionId: actor.institutionId,
        guardianId,
        purpose: dto.purpose,
        granted: dto.granted,
        noticeVersion: CURRENT_NOTICE_VERSION,
        source: dto.source,
        recordedBy: actor.id,
        note: dto.note ?? null,
      });
    } catch (error) {
      if (isForeignKeyViolation(error))
        throw new BadRequestException('Unknown guardian');
      throw error;
    }
    await this.audit.record({
      actorId: actor.id,
      action: 'consent.recorded',
      entity: 'guardian',
      entityId: guardianId,
      before: previous ? this.snapshot(previous) : null,
      after: this.snapshot(row),
      reason: dto.note,
    });
    return ConsentResponseDto.from(row);
  }

  private snapshot(consent: Consent): AuditSnapshot {
    return {
      purpose: consent.purpose,
      granted: consent.granted,
      noticeVersion: consent.noticeVersion,
    };
  }
}
