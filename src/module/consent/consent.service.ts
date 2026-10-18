import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthUser } from '@modules/auth/auth-user';
import { isForeignKeyViolation } from '@database/database.errors';
import { ConsentRow } from '@database/schema';
import { AuditService } from '@shared/audit/audit.service';
import { CURRENT_NOTICE_VERSION } from './consent.constants';
import { ConsentRepository } from './consent.repository';
import { RecordConsentDto } from './dto/consent.dto';
import { ConsentResponseDto } from './dto/consent.response.dto';

/** Minimal F1-15: per-purpose consent so SMS audiences can be filtered from day one. Every change is audited. */
@Injectable()
export class ConsentService {
  constructor(
    private readonly repo: ConsentRepository,
    private readonly audit: AuditService,
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
    let row: ConsentRow;
    try {
      row = await this.repo.upsert({
        institutionId: actor.institutionId,
        guardianId,
        purpose: dto.purpose,
        granted: dto.granted,
        noticeVersion: CURRENT_NOTICE_VERSION,
        source: dto.source,
        recordedBy: actor.id,
        note: dto.note,
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

  private snapshot(row: ConsentRow) {
    return {
      purpose: row.purpose,
      granted: row.granted,
      noticeVersion: row.noticeVersion,
    };
  }
}
