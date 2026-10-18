import { Injectable } from '@nestjs/common';
import { Between } from 'typeorm';
import { DatabaseService } from '@common/services/database/database.service';
import { HolidaysRepository } from '../../../../application/ports/holidays.repository.port';
import type { Holiday, NewHoliday } from '../../../../domain/holiday';
import { HolidayEntity } from '../entities/holiday.entity';
import { HolidayMapper } from '../mappers/holiday.mapper';

@Injectable()
export class HolidaysRelationalRepository implements HolidaysRepository {
  constructor(private readonly db: DatabaseService) {}

  async insert(data: NewHoliday): Promise<Holiday> {
    const row = await this.db.tenant((m) =>
      m.save(HolidayMapper.toPersistence(data)),
    );
    return HolidayMapper.toDomain(row);
  }

  async findBetween(from: string, to: string): Promise<Holiday[]> {
    const rows = await this.db.tenant((m) =>
      m.find(HolidayEntity, {
        where: { date: Between(from, to) },
        order: { date: 'ASC' },
      }),
    );
    return rows.map((row) => HolidayMapper.toDomain(row));
  }

  existsOn(date: string): Promise<boolean> {
    return this.db.tenant((m) => m.existsBy(HolidayEntity, { date }));
  }

  async remove(id: string): Promise<boolean> {
    const { affected } = await this.db.tenant((m) =>
      m.delete(HolidayEntity, { id }),
    );
    return !!affected;
  }
}
