import { Injectable } from '@nestjs/common';
import { Between } from 'typeorm';
import { DatabaseService } from '@common/services/database/database.service';
import type { Holiday, NewHoliday } from '../domain/holiday';
import { HolidaysRepositoryPort } from '../port/holidays.repository.port';
import { HolidayEntity } from './entities/holiday.entity';

@Injectable()
export class HolidaysRepository implements HolidaysRepositoryPort {
  constructor(private readonly db: DatabaseService) {}

  insert(data: NewHoliday): Promise<Holiday> {
    return this.db.tenant((m) => m.save(m.create(HolidayEntity, data)));
  }

  findBetween(from: string, to: string): Promise<Holiday[]> {
    return this.db.tenant((m) =>
      m.find(HolidayEntity, {
        where: { date: Between(from, to) },
        order: { date: 'ASC' },
      }),
    );
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
