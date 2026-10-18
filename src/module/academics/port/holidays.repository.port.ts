import type { Holiday, NewHoliday } from '../domain/holiday';

export abstract class HolidaysRepositoryPort {
  abstract insert(data: NewHoliday): Promise<Holiday>;
  abstract findBetween(from: string, to: string): Promise<Holiday[]>;
  abstract existsOn(date: string): Promise<boolean>;
  abstract remove(id: string): Promise<boolean>;
}
