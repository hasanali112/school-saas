import { Role } from '@modules/auth/roles';
import { UserRow } from '@database/schema';

export class AuthUserDto {
  readonly id: string;
  readonly institutionId: string;
  readonly phone: string;
  readonly name: string;
  readonly roles: Role[];

  private constructor(row: UserRow) {
    this.id = row.id;
    this.institutionId = row.institutionId;
    this.phone = row.phone;
    this.name = row.name;
    this.roles = row.roles as Role[];
  }

  static from(row: UserRow): AuthUserDto {
    return new AuthUserDto(row);
  }
}

export class TokenResponseDto {
  readonly tokenType = 'Bearer';

  constructor(
    readonly accessToken: string,
    readonly expiresIn: number,
    readonly user: AuthUserDto,
  ) {}
}

export class OtpRequestedDto {
  constructor(readonly expiresInSeconds: number) {}
}
