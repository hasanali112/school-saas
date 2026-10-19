import type { Role } from '@common/types/role';
import type {
  GuardianFilter,
  GuardianRecipient,
  StaffRecipient,
} from '../../domain/audience';

export abstract class AudienceRepository {
  /** Primary guardian of every active student matching the filter, with SMS consent joined in. */
  abstract findGuardianRecipients(
    filter: GuardianFilter,
  ): Promise<GuardianRecipient[]>;
  abstract findStaffRecipients(
    roles: readonly Role[],
  ): Promise<StaffRecipient[]>;
}
