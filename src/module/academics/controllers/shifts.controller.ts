import { Body, Controller, Get, Post } from '@nestjs/common';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Roles } from '@common/decorators/roles.decorator';
import type { AuthUser } from '@common/types/auth-user';
import { Role } from '@common/types/role';
import { ShiftResponseDto } from '../dto/academics.response.dto';
import { CreateShiftDto } from '../dto/create-shift.dto';
import { ShiftsFacade } from '../services/shifts.facade';

@Controller('academics/shifts')
export class ShiftsController {
  constructor(private readonly shifts: ShiftsFacade) {}

  @Get()
  list(): Promise<ShiftResponseDto[]> {
    return this.shifts.list();
  }

  @Post()
  @Roles([Role.InstituteHead, Role.AdminOfficer])
  create(
    @Body() dto: CreateShiftDto,
    @CurrentUser() actor: AuthUser,
  ): Promise<ShiftResponseDto> {
    return this.shifts.create(dto, actor);
  }
}
