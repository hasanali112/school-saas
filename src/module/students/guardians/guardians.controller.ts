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
import {
  GuardianChildDto,
  StudentGuardianResponseDto,
} from '../dto/guardian.response.dto';
import { LinkGuardianDto } from '../dto/link-guardian.dto';
import {
  STUDENT_READ_ROLES,
  STUDENT_WRITE_ROLES,
} from '../students.controller';
import { GuardiansService } from './guardians.service';

@Controller()
export class GuardiansController {
  constructor(private readonly guardians: GuardiansService) {}

  @Get('students/:id/guardians')
  @Roles(STUDENT_READ_ROLES)
  listForStudent(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<StudentGuardianResponseDto[]> {
    return this.guardians.listForStudent(id);
  }

  @Post('students/:id/guardians')
  @Roles(STUDENT_WRITE_ROLES)
  link(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: LinkGuardianDto,
    @CurrentUser() actor: AuthUser,
  ): Promise<StudentGuardianResponseDto> {
    return this.guardians.link(id, dto, actor);
  }

  @Delete('students/:id/guardians/:guardianId')
  @Roles(STUDENT_WRITE_ROLES)
  @HttpCode(HttpStatus.NO_CONTENT)
  unlink(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('guardianId', ParseUUIDPipe) guardianId: string,
  ): Promise<void> {
    return this.guardians.unlink(id, guardianId);
  }

  @Get('guardians/:id/students')
  @Roles(STUDENT_READ_ROLES)
  children(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<GuardianChildDto[]> {
    return this.guardians.children(id);
  }
}
