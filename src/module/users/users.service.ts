import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { PasswordService } from '@modules/auth/password.service';
import { AuthUser } from '@modules/auth/auth-user';
import { paginate, Paginated } from '@common/types/paginated';
import { isUniqueViolation } from '@database/database.errors';
import { UserRow } from '@database/schema';
import { DomainEvents } from '@shared/events/domain-events.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user.response.dto';
import { UserCreatedEvent } from './events/user-created.event';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly repo: UsersRepository,
    private readonly passwords: PasswordService,
    private readonly events: DomainEvents,
  ) {}

  async create(dto: CreateUserDto, actor: AuthUser): Promise<UserResponseDto> {
    const passwordHash = dto.password
      ? await this.passwords.hash(dto.password)
      : null;

    let row: UserRow;
    try {
      row = await this.repo.insert({
        institutionId: actor.institutionId,
        phone: dto.phone,
        name: dto.name,
        roles: dto.roles,
        passwordHash,
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException(
          `A user with phone ${dto.phone} already exists`,
        );
      }
      throw error;
    }

    this.events.publish(
      new UserCreatedEvent(actor.institutionId, row.id, actor.id),
    );
    return UserResponseDto.from(row);
  }

  async getById(id: string): Promise<UserResponseDto> {
    const row = await this.repo.findById(id);
    if (!row) throw new NotFoundException(`User ${id} not found`);
    return UserResponseDto.from(row);
  }

  async list(query: PaginationQueryDto): Promise<Paginated<UserResponseDto>> {
    const { rows, total } = await this.repo.findPage(query.offset, query.limit);
    return paginate(
      UserResponseDto.fromMany(rows),
      total,
      query.page,
      query.limit,
    );
  }
}
