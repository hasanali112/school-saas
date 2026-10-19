import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Roles } from '@common/decorators/roles.decorator';
import type { AuthUser } from '@common/types/auth-user';
import { Role } from '@common/types/role';
import {
  ClassResponseDto,
  SectionResponseDto,
} from '../dto/academics.response.dto';
import { CreateClassDto } from '../dto/create-class.dto';
import { CreateSectionDto } from '../dto/create-section.dto';
import { ClassesFacade } from '../services/classes.facade';

const MANAGE_ROLES = [Role.InstituteHead, Role.AdminOfficer];

@Controller('academics/classes')
export class ClassesController {
  constructor(private readonly classes: ClassesFacade) {}

  @Get()
  list(): Promise<ClassResponseDto[]> {
    return this.classes.list();
  }

  @Post()
  @Roles(MANAGE_ROLES)
  create(
    @Body() dto: CreateClassDto,
    @CurrentUser() actor: AuthUser,
  ): Promise<ClassResponseDto> {
    return this.classes.createClass(dto, actor);
  }

  @Post(':classId/sections')
  @Roles(MANAGE_ROLES)
  createSection(
    @Param('classId', ParseUUIDPipe) classId: string,
    @Body() dto: CreateSectionDto,
    @CurrentUser() actor: AuthUser,
  ): Promise<SectionResponseDto> {
    return this.classes.createSection(classId, dto, actor);
  }
}
