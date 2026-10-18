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
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import type { AuthUser } from '@modules/auth/auth-user';
import { Role } from '@modules/auth/roles';
import { CreateHolidayDto, HolidaysQueryDto } from '../dto/create-holiday.dto';
import { HolidayResponseDto } from '../dto/setup.response.dto';
import { HolidaysService } from './holidays.service';

const MANAGE_ROLES = [Role.InstituteHead, Role.AdminOfficer];

@Controller('academics/holidays')
export class HolidaysController {
  constructor(private readonly holidays: HolidaysService) {}

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
