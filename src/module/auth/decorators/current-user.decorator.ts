import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthenticatedRequest, AuthUser } from '../auth-user';

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AuthUser => {
    const { user } = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!user) throw new UnauthorizedException();
    return user;
  },
);
