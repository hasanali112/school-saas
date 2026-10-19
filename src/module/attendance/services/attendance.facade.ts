import { Injectable } from '@nestjs/common';
import type { AuthUser } from '@common/types/auth-user';
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
  MarkAttendanceDto,
  MarkStaffAttendanceDto,
  MonthQueryDto,
} from '../dto/mark-attendance.dto';
import { AttendanceService } from './attendance.service';

@Injectable()
export class AttendanceFacade {
  constructor(private readonly attendance: AttendanceService) {}

  sheet(
    sectionId: string,
    query: AttendanceSheetQueryDto,
    actor: AuthUser,
  ): Promise<AttendanceSheetDto> {
    return this.attendance.sheet(
      sectionId,
      query.date,
      query.period,
      actor,
      query.sessionId,
    );
  }

  mark(
    sectionId: string,
    dto: MarkAttendanceDto,
    actor: AuthUser,
  ): Promise<MarkResultDto> {
    return this.attendance.mark(sectionId, dto, actor);
  }

  register(
    sectionId: string,
    query: MonthQueryDto,
    actor: AuthUser,
  ): Promise<MonthlyRegisterDto> {
    return this.attendance.register(
      sectionId,
      query.month,
      actor,
      query.sessionId,
    );
  }

  summary(
    sectionId: string,
    query: MonthQueryDto,
    actor: AuthUser,
  ): Promise<MonthlySummaryDto> {
    return this.attendance.summary(
      sectionId,
      query.month,
      actor,
      query.sessionId,
    );
  }

  staffSheet(date: string): Promise<StaffAttendanceEntryResponseDto[]> {
    return this.attendance.staffSheet(date);
  }

  async markStaff(
    dto: MarkStaffAttendanceDto,
    actor: AuthUser,
  ): Promise<MarkedCountDto> {
    return new MarkedCountDto(await this.attendance.markStaff(dto, actor));
  }
}
