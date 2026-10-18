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
  Put,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '@module/auth/decorators/current-user.decorator';
import { Roles } from '@module/auth/decorators/roles.decorator';
import type { AuthUser } from '@module/auth/domain/auth-user';
import { Role } from '@module/auth/domain/role';
import {
  AssignClassTeacherDto,
  AssignTeacherDto,
  SessionQueryDto,
} from '../dto/assign-teacher.dto';
import {
  ClassTeacherResponseDto,
  MyAssignmentsResponseDto,
  SectionTeachersResponseDto,
  TeacherAssignmentResponseDto,
} from '../dto/setup.response.dto';
import { TeachersFacade } from '../service/teachers.facade';

const MANAGE_ROLES = [Role.InstituteHead, Role.AdminOfficer];

@Controller('academics')
export class TeachersController {
  constructor(private readonly teachers: TeachersFacade) {}

  /** Placed before the parameterised routes so "me" is never parsed as a section id. */
  @Get('teachers/me/assignments')
  @Roles([Role.ClassTeacher, Role.SubjectTeacher, Role.InstituteHead])
  myAssignments(
    @CurrentUser() actor: AuthUser,
    @Query() query: SessionQueryDto,
  ): Promise<MyAssignmentsResponseDto> {
    return this.teachers.myAssignments(actor, query.sessionId);
  }

  @Get('sections/:sectionId/teachers')
  listForSection(
    @Param('sectionId', ParseUUIDPipe) sectionId: string,
    @Query() query: SessionQueryDto,
  ): Promise<SectionTeachersResponseDto> {
    return this.teachers.listForSection(sectionId, query.sessionId);
  }

  @Post('sections/:sectionId/teachers')
  @Roles(MANAGE_ROLES)
  assign(
    @Param('sectionId', ParseUUIDPipe) sectionId: string,
    @Body() dto: AssignTeacherDto,
    @CurrentUser() actor: AuthUser,
  ): Promise<TeacherAssignmentResponseDto> {
    return this.teachers.assignSubjectTeacher(sectionId, dto, actor);
  }

  @Delete('sections/:sectionId/teachers/:assignmentId')
  @Roles(MANAGE_ROLES)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('sectionId', ParseUUIDPipe) sectionId: string,
    @Param('assignmentId', ParseUUIDPipe) assignmentId: string,
  ): Promise<void> {
    return this.teachers.removeSubjectTeacher(sectionId, assignmentId);
  }

  @Put('sections/:sectionId/class-teacher')
  @Roles(MANAGE_ROLES)
  assignClassTeacher(
    @Param('sectionId', ParseUUIDPipe) sectionId: string,
    @Body() dto: AssignClassTeacherDto,
    @CurrentUser() actor: AuthUser,
  ): Promise<ClassTeacherResponseDto> {
    return this.teachers.assignClassTeacher(sectionId, dto, actor);
  }
}
