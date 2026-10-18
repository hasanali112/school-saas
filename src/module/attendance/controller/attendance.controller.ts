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
  AttendanceSheetDto,
  MarkedCountDto,
  MarkResultDto,
  MonthlyRegisterDto,
  MonthlySummaryDto,
  StaffAttendanceEntryResponseDto,
} from '../dto/attendance.response.dto';
import {
  AttendanceSheetQueryDto,
  DateQueryDto,
  MarkAttendanceDto,
  MarkStaffAttendanceDto,
  MonthQueryDto,
} from '../dto/mark-attendance.dto';
import { AttendanceFacade } from '../service/attendance.facade';

const TEACHING_ROLES = [
  Role.InstituteHead,
  Role.AdminOfficer,
  Role.ClassTeacher,
  Role.SubjectTeacher,
];
const STAFF_ROLES = [Role.InstituteHead, Role.AdminOfficer, Role.HrOfficer];

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendance: AttendanceFacade) {}

  @Get('sections/:sectionId')
  @Roles(TEACHING_ROLES)
  sheet(
    @Param('sectionId', ParseUUIDPipe) sectionId: string,
    @Query() query: AttendanceSheetQueryDto,
    @CurrentUser() actor: AuthUser,
  ): Promise<AttendanceSheetDto> {
    return this.attendance.sheet(sectionId, query, actor);
  }

  @Post('sections/:sectionId')
  @Roles(TEACHING_ROLES)
  @HttpCode(HttpStatus.OK)
  mark(
    @Param('sectionId', ParseUUIDPipe) sectionId: string,
    @Body() dto: MarkAttendanceDto,
    @CurrentUser() actor: AuthUser,
  ): Promise<MarkResultDto> {
    return this.attendance.mark(sectionId, dto, actor);
  }

  @Get('sections/:sectionId/register')
  @Roles(TEACHING_ROLES)
  register(
    @Param('sectionId', ParseUUIDPipe) sectionId: string,
    @Query() query: MonthQueryDto,
    @CurrentUser() actor: AuthUser,
  ): Promise<MonthlyRegisterDto> {
    return this.attendance.register(sectionId, query, actor);
  }

  @Get('sections/:sectionId/summary')
  @Roles(TEACHING_ROLES)
  summary(
    @Param('sectionId', ParseUUIDPipe) sectionId: string,
    @Query() query: MonthQueryDto,
    @CurrentUser() actor: AuthUser,
  ): Promise<MonthlySummaryDto> {
    return this.attendance.summary(sectionId, query, actor);
  }

  @Get('staff')
  @Roles(STAFF_ROLES)
  staffSheet(
    @Query() query: DateQueryDto,
  ): Promise<StaffAttendanceEntryResponseDto[]> {
    return this.attendance.staffSheet(query.date);
  }

  @Post('staff')
  @Roles(STAFF_ROLES)
  @HttpCode(HttpStatus.OK)
  markStaff(
    @Body() dto: MarkStaffAttendanceDto,
    @CurrentUser() actor: AuthUser,
  ): Promise<MarkedCountDto> {
    return this.attendance.markStaff(dto, actor);
  }
}
