import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '@module/auth/decorators/current-user.decorator';
import { Roles } from '@module/auth/decorators/roles.decorator';
import type { AuthUser } from '@module/auth/domain/auth-user';
import { Role } from '@module/auth/domain/role';
import { SessionResponseDto } from '../dto/academics.response.dto';
import { CreateSessionDto } from '../dto/create-session.dto';
import { SessionsFacade } from '../service/sessions.facade';

const MANAGE_ROLES = [Role.InstituteHead, Role.AdminOfficer];

@Controller('academics/sessions')
export class SessionsController {
  constructor(private readonly sessions: SessionsFacade) {}

  @Get()
  list(): Promise<SessionResponseDto[]> {
    return this.sessions.list();
  }

  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string): Promise<SessionResponseDto> {
    return this.sessions.getById(id);
  }

  @Post()
  @Roles(MANAGE_ROLES)
  create(
    @Body() dto: CreateSessionDto,
    @CurrentUser() actor: AuthUser,
  ): Promise<SessionResponseDto> {
    return this.sessions.create(dto, actor);
  }

  @Post(':id/current')
  @Roles(MANAGE_ROLES)
  @HttpCode(HttpStatus.OK)
  setCurrent(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SessionResponseDto> {
    return this.sessions.setCurrent(id);
  }
}
