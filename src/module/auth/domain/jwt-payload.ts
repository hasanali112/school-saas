import { Role } from './role';

export interface JwtPayload {
  sub: string;
  institutionId: string;
  roles: Role[];
}
