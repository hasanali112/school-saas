import { Role } from '@modules/auth/roles';
import { UserRow } from '@database/schema';

/** Never includes passwordHash. */
export class UserResponseDto {
  readonly id: string;
  readonly phone: string;
  readonly name: string;
  readonly roles: Role[];
  readonly status: UserRow['status'];
  readonly createdAt: Date;

  private constructor(row: UserRow) {
    this.id = row.id;
    this.phone = row.phone;
    this.name = row.name;
    this.roles = row.roles as Role[];
    this.status = row.status;
    this.createdAt = row.createdAt;
  }

  static from(row: UserRow): UserResponseDto {
    return new UserResponseDto(row);
  }

  static fromMany(rows: readonly UserRow[]): UserResponseDto[] {
    return rows.map((row) => UserResponseDto.from(row));
  }
}
