import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { isUniqueViolation } from '@common/services/database/database-errors';
import type { AuthUser } from '@module/auth/domain/auth-user';
import { ClockPort } from '@module/time/application/ports/clock.port';
import type { Holiday } from '../domain/holiday';
import { CreateHolidayDto, HolidaysQueryDto } from '../dto/create-holiday.dto';
import { HolidayResponseDto } from '../dto/setup.response.dto';
import { HolidaysRepository } from '../application/ports/holidays.repository.port';

const ISO_DATE_LENGTH = 10;
const YEAR_LENGTH = 4;

@Injectable()
export class HolidaysService {
  constructor(
    private readonly repo: HolidaysRepository,
    private readonly clock: ClockPort,
  ) {}

  async create(
    dto: CreateHolidayDto,
    actor: AuthUser,
  ): Promise<HolidayResponseDto> {
    let row: Holiday;
    try {
      row = await this.repo.insert({
        date: dto.date,
        nameBn: dto.nameBn,
        nameEn: dto.nameEn,
        kind: dto.kind,
        institutionId: actor.institutionId,
      });
    } catch (error) {
      if (isUniqueViolation(error))
        throw new ConflictException(`A holiday already exists on ${dto.date}`);
      throw error;
    }
    return HolidayResponseDto.from(row);
  }

  /** Defaults to the current calendar year, which is also the Bangladeshi academic year. */
  async list(query: HolidaysQueryDto): Promise<HolidayResponseDto[]> {
    const year = this.clock.today().slice(0, YEAR_LENGTH);
    const from = query.from ?? `${year}-01-01`;
    const to = query.to ?? `${year}-12-31`;
    if (from > to) throw new BadRequestException('from must not be after to');
    return HolidayResponseDto.fromMany(await this.repo.findBetween(from, to));
  }

  isHoliday(date: string): Promise<boolean> {
    return this.repo.existsOn(date.slice(0, ISO_DATE_LENGTH));
  }

  async remove(id: string): Promise<void> {
    const removed = await this.repo.remove(id);
    if (!removed) throw new NotFoundException(`Holiday ${id} not found`);
  }
}
