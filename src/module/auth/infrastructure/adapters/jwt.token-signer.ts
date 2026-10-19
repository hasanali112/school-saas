import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { JwtPayload } from '../../domain/jwt-payload';
import { Role } from '@common/types/role';
import { TokenSignerPort } from '../../application/ports/token-signer.port';

const ROLES = new Set<string>(Object.values(Role));

@Injectable()
export class JwtTokenSigner implements TokenSignerPort {
  constructor(private readonly jwt: JwtService) {}

  sign(payload: JwtPayload): string {
    return this.jwt.sign({ ...payload });
  }

  verify(token: string): JwtPayload | undefined {
    let decoded: unknown;
    try {
      decoded = this.jwt.verify(token);
    } catch {
      return undefined;
    }
    return this.isPayload(decoded) ? decoded : undefined;
  }

  private isPayload(value: unknown): value is JwtPayload {
    if (typeof value !== 'object' || value === null) return false;
    const candidate = value as Partial<JwtPayload>;
    return (
      typeof candidate.sub === 'string' &&
      typeof candidate.institutionId === 'string' &&
      Array.isArray(candidate.roles) &&
      candidate.roles.every((role) => ROLES.has(role))
    );
  }
}
