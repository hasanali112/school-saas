import type { JwtPayload } from '../../domain/jwt-payload';

export abstract class TokenSignerPort {
  abstract sign(payload: JwtPayload): string;
  /** The payload of a valid, unexpired token; undefined for anything else. */
  abstract verify(token: string): JwtPayload | undefined;
}
