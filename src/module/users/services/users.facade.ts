import { Injectable } from '@nestjs/common';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { Paginated } from '@common/types/paginated';
import type { AuthUser } from '@module/auth/domain/auth-user';
import type { StaffMember } from '../domain/user';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserResponseDto } from '../dto/user.response.dto';
import { UsersService } from './users.service';

@Injectable()
export class UsersFacade {
  constructor(private readonly users: UsersService) {}

  create(dto: CreateUserDto, actor: AuthUser): Promise<UserResponseDto> {
    return this.users.create(dto, actor);
  }

  getById(id: string): Promise<UserResponseDto> {
    return this.users.getById(id);
  }

  list(query: PaginationQueryDto): Promise<Paginated<UserResponseDto>> {
    return this.users.list(query);
  }

  /** For staff attendance. */
  listActiveStaff(): Promise<StaffMember[]> {
    return this.users.listActiveStaff();
  }
}
