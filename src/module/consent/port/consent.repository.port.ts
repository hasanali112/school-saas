import type { Consent, ConsentPurpose, NewConsent } from '../domain/consent';

export abstract class ConsentRepositoryPort {
  abstract findForGuardian(guardianId: string): Promise<Consent[]>;
  abstract findOne(
    guardianId: string,
    purpose: ConsentPurpose,
  ): Promise<Consent | undefined>;
  /** One row per guardian and purpose: a repeat decision replaces the previous one. */
  abstract upsert(data: NewConsent): Promise<Consent>;
}
