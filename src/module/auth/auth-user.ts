import type { Request } from 'express';
import { Role } from './roles';

/** The principal attached to every authenticated request. Kept small: it is read on every call. */
export interface AuthUser {
  id: string;
  institutionId: string;
  roles: Role[];
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}
