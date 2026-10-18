import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@common/services/database/database.service';
import type { Page } from '@common/types/paginated';
import { UserStatus } from '../domain/user';
import type { NewUser, StaffMember, User } from '../domain/user';
import { UsersRepositoryPort } from '../port/users.repository.port';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersRepository implements UsersRepositoryPort {
  constructor(private readonly db: DatabaseService) {}

  insert(data: NewUser): Promise<User> {
    return this.db.tenant((m) => m.save(m.create(UserEntity, data)));
  }

  async findById(id: string): Promise<User | undefined> {
    return (
      (await this.db.tenant((m) => m.findOneBy(UserEntity, { id }))) ??
      undefined
    );
  }

  findPage(offset: number, limit: number): Promise<Page<User>> {
    return this.db.tenant(async (m) => {
      const [rows, total] = await m.findAndCount(UserEntity, {
        order: { name: 'ASC' },
        skip: offset,
        take: limit,
      });
      return { rows, total };
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
