import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '@module/auth/decorators/current-user.decorator';
import { Roles } from '@module/auth/decorators/roles.decorator';
import type { AuthUser } from '@module/auth/domain/auth-user';
import { SessionQueryDto } from '@module/academics/dto/assign-teacher.dto';
import { EnrolStudentDto } from '../dto/enrol-student.dto';
import {
  EnrolmentResponseDto,
  RosterResponseDto,
} from '../dto/enrolment.response.dto';
import { STUDENT_READ_ROLES, STUDENT_WRITE_ROLES } from './student-roles';
import { EnrolmentsFacade } from '../services/enrolments.facade';

@Controller()
export class EnrolmentsController {
  constructor(private readonly enrolments: EnrolmentsFacade) {}

  @Get('students/:id/enrolments')
  @Roles(STUDENT_READ_ROLES)
  listForStudent(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<EnrolmentResponseDto[]> {
    return this.enrolments.listForStudent(id);
  }

  @Post('students/:id/enrolments')
  @Roles(STUDENT_WRITE_ROLES)
  enrol(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: EnrolStudentDto,
    @CurrentUser() actor: AuthUser,
  ): Promise<EnrolmentResponseDto> {
    return this.enrolments.enrol(id, dto, actor);
  }

  /** Section roster for a session, ordered by roll. */
  @Get('sections/:sectionId/roster')
  @Roles(STUDENT_READ_ROLES)
  roster(
    @Param('sectionId', ParseUUIDPipe) sectionId: string,
    @Query() query: SessionQueryDto,
  ): Promise<RosterResponseDto> {
    return this.enrolments.roster(sectionId, query.sessionId);
  }
}
