import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { Paginated } from '@common/types/paginated';
import { CurrentUser } from '@module/auth/decorators/current-user.decorator';
import { Roles } from '@module/auth/decorators/roles.decorator';
import type { AuthUser } from '@module/auth/domain/auth-user';
import { Role } from '@module/auth/domain/role';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserResponseDto } from '../dto/user.response.dto';
import { UsersFacade } from '../service/users.facade';

const MANAGE_ROLES = [Role.InstituteHead, Role.AdminOfficer, Role.HrOfficer];

@Controller('users')
@Roles(MANAGE_ROLES)
export class UsersController {
  constructor(private readonly users: UsersFacade) {}

  @Get()
  list(
    @Query() query: PaginationQueryDto,
  ): Promise<Paginated<UserResponseDto>> {
    return this.users.list(query);
  }

  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string): Promise<UserResponseDto> {
    return this.users.getById(id);
  }

  @Post()
  create(
    @Body() dto: CreateUserDto,
    @CurrentUser() actor: AuthUser,
  ): Promise<UserResponseDto> {
    return this.users.create(dto, actor);
  }
}
