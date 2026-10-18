import type { Consent, NewConsent } from '../../../../domain/consent';
import { ConsentEntity } from '../entities/consent.entity';

/** Converts between the `Consent` domain type and its TypeORM row. */
export class ConsentMapper {
  static toDomain(entity: ConsentEntity): Consent {
    return {
      id: entity.id,
      institutionId: entity.institutionId,
      guardianId: entity.guardianId,
      purpose: entity.purpose,
      granted: entity.granted,
      noticeVersion: entity.noticeVersion,
      source: entity.source,
      recordedBy: entity.recordedBy,
      note: entity.note,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toPersistence(data: NewConsent): ConsentEntity {
    const entity = new ConsentEntity();
    entity.institutionId = data.institutionId;
    entity.guardianId = data.guardianId;
    entity.purpose = data.purpose;
    entity.granted = data.granted;
    entity.noticeVersion = data.noticeVersion;
    entity.source = data.source;
    entity.recordedBy = data.recordedBy;
    entity.note = data.note;
    return entity;
  }
}
