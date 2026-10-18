import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@common/services/database/database.service';
import type { Page } from '@common/types/paginated';
import { UserStatus } from '../../../../domain/user';
import type { NewUser, StaffMember, User } from '../../../../domain/user';
import { UsersRepository } from '../../../../application/ports/users.repository.port';
import { UserEntity } from '../entities/user.entity';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class UsersRelationalRepository implements UsersRepository {
  constructor(private readonly db: DatabaseService) {}

  async insert(data: NewUser): Promise<User> {
    const row = await this.db.tenant((m) =>
      m.save(UserMapper.toPersistence(data)),
    );
    return UserMapper.toDomain(row);
  }

  async findById(id: string): Promise<User | undefined> {
    const row = await this.db.tenant((m) => m.findOneBy(UserEntity, { id }));
    return row ? UserMapper.toDomain(row) : undefined;
  }

  findPage(offset: number, limit: number): Promise<Page<User>> {
    return this.db.tenant(async (m) => {
      const [rows, total] = await m.findAndCount(UserEntity, {
        order: { name: 'ASC' },
        skip: offset,
        take: limit,
      });
      return { rows: rows.map((row) => UserMapper.toDomain(row)), total };
    });
  }

  async findActiveStaff(): Promise<StaffMember[]> {
    const rows = await this.db.tenant((m) =>
      m.find(UserEntity, {
        select: { id: true, name: true },
        where: { status: UserStatus.Active },
        order: { name: 'ASC' },
      }),
    );
    return rows.map((row) => ({ userId: row.id, name: row.name }));
  }
}
