import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '../decorators/roles.decorator';
import { AuthenticatedRequest } from '../auth-user';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride(Roles, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!required?.length) return true;

    const { user } = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!user) return false;

    const held = new Set(user.roles);
    if (!required.some((role) => held.has(role))) {
      throw new ForbiddenException('Insufficient role');
    }
    return true;
  }
}
