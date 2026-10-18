import { Injectable } from '@nestjs/common';
import type { AuthUser } from '@module/auth/domain/auth-user';
import { CreateHolidayDto, HolidaysQueryDto } from '../dto/create-holiday.dto';
import { HolidayResponseDto } from '../dto/setup.response.dto';
import { HolidaysService } from './holidays.service';

@Injectable()
export class HolidaysFacade {
  constructor(private readonly holidays: HolidaysService) {}

  create(dto: CreateHolidayDto, actor: AuthUser): Promise<HolidayResponseDto> {
    return this.holidays.create(dto, actor);
  }

  list(query: HolidaysQueryDto): Promise<HolidayResponseDto[]> {
    return this.holidays.list(query);
  }

  remove(id: string): Promise<void> {
    return this.holidays.remove(id);
  }

  /** Attendance refuses to mark on a holiday. */
  isHoliday(date: string): Promise<boolean> {
    return this.holidays.isHoliday(date);
  }
}
