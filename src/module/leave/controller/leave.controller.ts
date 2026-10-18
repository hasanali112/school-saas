import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '@module/auth/decorators/current-user.decorator';
import { Roles } from '@module/auth/decorators/roles.decorator';
import type { AuthUser } from '@module/auth/domain/auth-user';
import { Role } from '@module/auth/domain/role';
import {
  ApplyLeaveDto,
  CreateLeaveTypeDto,
  DecideLeaveDto,
  ListLeaveQueryDto,
} from '../dto/leave.dto';
import {
  LeaveApplicationResponseDto,
  LeaveTypeResponseDto,
} from '../dto/leave.response.dto';
import { LeaveFacade } from '../service/leave.facade';

const TYPE_MANAGERS = [Role.InstituteHead, Role.AdminOfficer, Role.HrOfficer];
const APPROVERS = [Role.InstituteHead, Role.AdminOfficer];

@Controller('leave')
export class LeaveController {
  constructor(private readonly leave: LeaveFacade) {}

  @Get('types')
  listTypes(): Promise<LeaveTypeResponseDto[]> {
    return this.leave.listTypes();
  }

  @Post('types')
  @Roles(TYPE_MANAGERS)
  createType(
    @Body() dto: CreateLeaveTypeDto,
    @CurrentUser() actor: AuthUser,
  ): Promise<LeaveTypeResponseDto> {
    return this.leave.createType(dto, actor);
  }

  /** Any authenticated staff member may apply; visibility of the list is narrowed in the service. */
  @Get('applications')
  list(
    @Query() query: ListLeaveQueryDto,
    @CurrentUser() actor: AuthUser,
  ): Promise<LeaveApplicationResponseDto[]> {
    return this.leave.list(query, actor);
  }

  @Post('applications')
  apply(
    @Body() dto: ApplyLeaveDto,
    @CurrentUser() actor: AuthUser,
  ): Promise<LeaveApplicationResponseDto> {
    return this.leave.apply(dto, actor);
  }

  @Post('applications/:id/approve')
  @Roles(APPROVERS)
  @HttpCode(HttpStatus.OK)
  approve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DecideLeaveDto,
    @CurrentUser() actor: AuthUser,
  ): Promise<LeaveApplicationResponseDto> {
    return this.leave.approve(id, dto, actor);
  }

  @Post('applications/:id/reject')
  @Roles(APPROVERS)
  @HttpCode(HttpStatus.OK)
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DecideLeaveDto,
    @CurrentUser() actor: AuthUser,
  ): Promise<LeaveApplicationResponseDto> {
    return this.leave.reject(id, dto, actor);
  }

  @Post('applications/:id/cancel')
  @HttpCode(HttpStatus.OK)
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthUser,
  ): Promise<LeaveApplicationResponseDto> {
    return this.leave.cancel(id, actor);
  }
}
