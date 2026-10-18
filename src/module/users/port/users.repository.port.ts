import type { Page } from '@common/types/paginated';
import type { NewUser, StaffMember, User } from '../domain/user';

export abstract class UsersRepositoryPort {
  abstract insert(data: NewUser): Promise<User>;
  abstract findById(id: string): Promise<User | undefined>;
  abstract findPage(offset: number, limit: number): Promise<Page<User>>;
  /** Every active user of the tenant, ordered by name. */
  abstract findActiveStaff(): Promise<StaffMember[]>;
}
