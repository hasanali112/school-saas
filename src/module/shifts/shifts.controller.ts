import { Body, Controller, Get, Post } from '@nestjs/common';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import type { AuthUser } from '@modules/auth/auth-user';
import { Role } from '@modules/auth/roles';
import { ShiftResponseDto } from '../dto/academics.response.dto';
import { CreateShiftDto } from '../dto/create-shift.dto';
import { ShiftsService } from './shifts.service';

@Controller('academics/shifts')
export class ShiftsController {
  constructor(private readonly shifts: ShiftsService) {}

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
