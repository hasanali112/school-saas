import type { Institution, InstitutionPatch } from '../../domain/institution';

/** RLS limits the institutions table to the tenant's own row. */
export abstract class InstitutionsRepository {
  abstract findCurrent(): Promise<Institution | undefined>;
  abstract updateCurrent(
    id: string,
    patch: InstitutionPatch,
  ): Promise<Institution | undefined>;
}
