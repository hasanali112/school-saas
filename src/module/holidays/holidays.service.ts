import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthUser } from '@modules/auth/auth-user';
import { isUniqueViolation } from '@database/database.errors';
import { HolidayRow } from '@database/schema';
import { CreateHolidayDto, HolidaysQueryDto } from '../dto/create-holiday.dto';
import { HolidayResponseDto } from '../dto/setup.response.dto';
import { HolidaysRepository } from './holidays.repository';

const ISO_DATE_LENGTH = 10;

@Injectable()
export class HolidaysService {
  constructor(private readonly repo: HolidaysRepository) {}

  async create(
    dto: CreateHolidayDto,
    actor: AuthUser,
  ): Promise<HolidayResponseDto> {
    let row: HolidayRow;
    try {
      row = await this.repo.insert({
        ...dto,
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
    const year = new Date().getUTCFullYear();
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
