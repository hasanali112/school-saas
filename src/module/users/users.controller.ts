import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import type { AuthUser } from '@modules/auth/auth-user';
import { Paginated } from '@common/types/paginated';
import { Role } from '@modules/auth/roles';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user.response.dto';
import { UsersService } from './users.service';

const MANAGE_ROLES = [Role.InstituteHead, Role.AdminOfficer, Role.HrOfficer];

@Controller('users')
@Roles(MANAGE_ROLES)
export class UsersController {
  constructor(private readonly users: UsersService) {}

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
