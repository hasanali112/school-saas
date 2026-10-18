import { Role } from '@module/auth/domain/role';
import { UserStatus } from '../domain/user';
import type { User } from '../domain/user';

/** Never includes passwordHash. */
export class UserResponseDto {
  readonly id: string;
  readonly phone: string;
  readonly name: string;
  readonly roles: Role[];
  readonly status: UserStatus;
  readonly createdAt: Date;

  private constructor(user: User) {
    this.id = user.id;
    this.phone = user.phone;
    this.name = user.name;
    this.roles = user.roles;
    this.status = user.status;
    this.createdAt = user.createdAt;
  }

  static from(user: User): UserResponseDto {
    return new UserResponseDto(user);
  }

  static fromMany(users: readonly User[]): UserResponseDto[] {
    return users.map((user) => UserResponseDto.from(user));
  }
}
