import type { Request } from 'express';
import type { AuthUser } from '../domain/auth-user';

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}
