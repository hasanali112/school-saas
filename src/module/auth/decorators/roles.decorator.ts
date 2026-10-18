import { Reflector } from '@nestjs/core';
import { Role } from '../domain/role';

/** Coarse route-level access. Resource-level checks (own section, own child) live in services. */
export const Roles = Reflector.createDecorator<Role[]>();
