import type { Request } from 'express';
import type { AuthUser } from './auth-user';

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}
