import { Role } from '@modules/auth/roles';

export interface JwtPayload {
  sub: string;
  institutionId: string;
  roles: Role[];
}
