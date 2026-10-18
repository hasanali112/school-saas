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
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import type { AuthUser } from '@modules/auth/auth-user';
import { Role } from '@modules/auth/roles';
import { AttendanceService } from './attendance.service';
import {
  AttendanceSheetDto,
  MarkedCountDto,
  MarkResultDto,
  MonthlyRegisterDto,
  MonthlySummaryDto,
  StaffAttendanceEntryResponseDto,
} from './dto/attendance.response.dto';
import {
  AttendanceSheetQueryDto,
  DateQueryDto,
  MarkAttendanceDto,
  MarkStaffAttendanceDto,
  MonthQueryDto,
} from './dto/mark-attendance.dto';

const TEACHING_ROLES = [
  Role.InstituteHead,
  Role.AdminOfficer,
  Role.ClassTeacher,
  Role.SubjectTeacher,
];
const STAFF_ROLES = [Role.InstituteHead, Role.AdminOfficer, Role.HrOfficer];

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendance: AttendanceService) {}

  @Get('sections/:sectionId')
  @Roles(TEACHING_ROLES)
  sheet(
    @Param('sectionId', ParseUUIDPipe) sectionId: string,
    @Query() query: AttendanceSheetQueryDto,
    @CurrentUser() actor: AuthUser,
  ): Promise<AttendanceSheetDto> {
    return this.attendance.sheet(
      sectionId,
      query.date,
      query.period,
      actor,
      query.sessionId,
    );
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
    return this.attendance.register(
      sectionId,
      query.month,
      actor,
      query.sessionId,
    );
  }

  @Get('sections/:sectionId/summary')
  @Roles(TEACHING_ROLES)
  summary(
    @Param('sectionId', ParseUUIDPipe) sectionId: string,
    @Query() query: MonthQueryDto,
    @CurrentUser() actor: AuthUser,
  ): Promise<MonthlySummaryDto> {
    return this.attendance.summary(
      sectionId,
      query.month,
      actor,
      query.sessionId,
    );
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
  async markStaff(
    @Body() dto: MarkStaffAttendanceDto,
    @CurrentUser() actor: AuthUser,
  ): Promise<MarkedCountDto> {
    return { marked: await this.attendance.markStaff(dto, actor) };
  }
}
