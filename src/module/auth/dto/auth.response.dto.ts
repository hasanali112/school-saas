import type { User } from '@module/users/domain/user';
import { Role } from '../domain/role';

export class AuthUserDto {
  readonly id: string;
  readonly institutionId: string;
  readonly phone: string;
  readonly name: string;
  readonly roles: Role[];

  private constructor(user: User) {
    this.id = user.id;
    this.institutionId = user.institutionId;
    this.phone = user.phone;
    this.name = user.name;
    this.roles = user.roles;
  }

  static from(user: User): AuthUserDto {
    return new AuthUserDto(user);
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
