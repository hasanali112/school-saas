import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { isUniqueViolation } from '@common/services/database/database-errors';
import { paginate, Paginated } from '@common/types/paginated';
import type { AuthUser } from '@module/auth/domain/auth-user';
import { AuthFacade } from '@module/auth/service/auth.facade';
import { EventPublisherPort } from '@module/events/port/event-publisher.port';
import type { StaffMember, User } from '../domain/user';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserResponseDto } from '../dto/user.response.dto';
import { UserCreatedEvent } from '../events/user-created.event';
import { UsersRepositoryPort } from '../port/users.repository.port';

@Injectable()
export class UsersService {
  constructor(
    private readonly repo: UsersRepositoryPort,
    private readonly auth: AuthFacade,
    private readonly events: EventPublisherPort,
  ) {}

  async create(dto: CreateUserDto, actor: AuthUser): Promise<UserResponseDto> {
    const passwordHash = dto.password
      ? await this.auth.hashPassword(dto.password)
      : null;

    let row: User;
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
    return paginate(UserResponseDto.fromMany(rows), total, query);
  }

  listActiveStaff(): Promise<StaffMember[]> {
    return this.repo.findActiveStaff();
  }
}
