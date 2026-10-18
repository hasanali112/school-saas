import type { NewUser, User } from '../../../../domain/user';
import { UserEntity } from '../entities/user.entity';

/** Converts between the `User` domain type and its TypeORM row. */
export class UserMapper {
  static toDomain(entity: UserEntity): User {
    return {
      id: entity.id,
      institutionId: entity.institutionId,
      phone: entity.phone,
      name: entity.name,
      passwordHash: entity.passwordHash,
      roles: entity.roles,
      status: entity.status,
      createdAt: entity.createdAt,
    };
  }

  static toPersistence(data: NewUser): UserEntity {
    const entity = new UserEntity();
    entity.institutionId = data.institutionId;
    entity.phone = data.phone;
    entity.name = data.name;
    entity.passwordHash = data.passwordHash;
    entity.roles = data.roles;
    return entity;
  }
}
