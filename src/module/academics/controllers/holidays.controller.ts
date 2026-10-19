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
  Query,
} from '@nestjs/common';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Roles } from '@common/decorators/roles.decorator';
import type { AuthUser } from '@common/types/auth-user';
import { Role } from '@common/types/role';
import { CreateHolidayDto, HolidaysQueryDto } from '../dto/create-holiday.dto';
import { HolidayResponseDto } from '../dto/setup.response.dto';
import { HolidaysFacade } from '../services/holidays.facade';

const MANAGE_ROLES = [Role.InstituteHead, Role.AdminOfficer];

@Controller('academics/holidays')
export class HolidaysController {
  constructor(private readonly holidays: HolidaysFacade) {}

  @Get()
  list(@Query() query: HolidaysQueryDto): Promise<HolidayResponseDto[]> {
    return this.holidays.list(query);
  }

  @Post()
  @Roles(MANAGE_ROLES)
  create(
    @Body() dto: CreateHolidayDto,
    @CurrentUser() actor: AuthUser,
  ): Promise<HolidayResponseDto> {
    return this.holidays.create(dto, actor);
  }

  @Delete(':id')
  @Roles(MANAGE_ROLES)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.holidays.remove(id);
  }
}
