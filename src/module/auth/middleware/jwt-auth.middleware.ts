import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Response } from 'express';
import { tenantContext } from '@common/services/database/tenant-context';
import { AuthFacade } from '../services/auth.facade';
import type { AuthenticatedRequest } from '@common/types/authenticated-request';

const BEARER = /^Bearer\s+(.+)$/i;

/**
 * Verifies the bearer token, attaches the principal and opens the tenant context for
 * the rest of the request. A missing or bad token leaves the request anonymous: the
 * global AuthGuard then refuses every route that is not `@Public()`.
 */
@Injectable()
export class JwtAuthMiddleware implements NestMiddleware {
  constructor(private readonly auth: AuthFacade) {}

  use(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
    const token = BEARER.exec(req.headers.authorization ?? '')?.[1];
    const user = token ? this.auth.authenticate(token) : undefined;
    if (!user) return next();
    req.user = user;
    tenantContext.run({ institutionId: user.institutionId }, () => next());
  }
}
