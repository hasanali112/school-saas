import type { Role } from '@module/auth/domain/role';
import type {
  GuardianFilter,
  GuardianRecipient,
  StaffRecipient,
} from '../domain/audience';

export abstract class AudienceRepositoryPort {
  /** Primary guardian of every active student matching the filter, with SMS consent joined in. */
  abstract findGuardianRecipients(
    filter: GuardianFilter,
  ): Promise<GuardianRecipient[]>;
  abstract findStaffRecipients(
    roles: readonly Role[],
  ): Promise<StaffRecipient[]>;
}
