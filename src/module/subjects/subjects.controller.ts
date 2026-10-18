import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import type { AuthUser } from '@modules/auth/auth-user';
import { Role } from '@modules/auth/roles';
import { AttachClassSubjectDto } from '../dto/attach-class-subject.dto';
import { CreateSubjectDto } from '../dto/create-subject.dto';
import {
  ClassSubjectResponseDto,
  SubjectResponseDto,
} from '../dto/setup.response.dto';
import { SubjectsService } from './subjects.service';

const MANAGE_ROLES = [Role.InstituteHead, Role.AdminOfficer];

@Controller('academics')
export class SubjectsController {
  constructor(private readonly subjects: SubjectsService) {}

  @Get('subjects')
  list(): Promise<SubjectResponseDto[]> {
    return this.subjects.list();
  }

  @Post('subjects')
  @Roles(MANAGE_ROLES)
  create(
    @Body() dto: CreateSubjectDto,
    @CurrentUser() actor: AuthUser,
  ): Promise<SubjectResponseDto> {
    return this.subjects.create(dto, actor);
  }

  @Get('classes/:classId/subjects')
  listForClass(
    @Param('classId', ParseUUIDPipe) classId: string,
  ): Promise<ClassSubjectResponseDto[]> {
    return this.subjects.listForClass(classId);
  }

  @Post('classes/:classId/subjects')
  @Roles(MANAGE_ROLES)
  attach(
    @Param('classId', ParseUUIDPipe) classId: string,
    @Body() dto: AttachClassSubjectDto,
    @CurrentUser() actor: AuthUser,
  ): Promise<ClassSubjectResponseDto> {
    return this.subjects.attachToClass(classId, dto, actor);
  }

  @Delete('classes/:classId/subjects/:subjectId')
  @Roles(MANAGE_ROLES)
  @HttpCode(HttpStatus.NO_CONTENT)
  detach(
    @Param('classId', ParseUUIDPipe) classId: string,
    @Param('subjectId', ParseUUIDPipe) subjectId: string,
  ): Promise<void> {
    return this.subjects.detachFromClass(classId, subjectId);
  }
}
