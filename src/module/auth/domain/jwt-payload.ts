import { Role } from '@common/types/role';

export interface JwtPayload {
  sub: string;
  institutionId: string;
  roles: Role[];
}
