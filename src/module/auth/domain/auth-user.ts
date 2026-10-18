import { Role } from './role';

/** The principal attached to every authenticated request. Kept small: it is read on every call. */
export interface AuthUser {
  id: string;
  institutionId: string;
  roles: Role[];
}
