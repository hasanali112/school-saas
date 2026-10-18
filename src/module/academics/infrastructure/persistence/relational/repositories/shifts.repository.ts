import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@common/services/database/database.service';
import { ShiftsRepository } from '../../../../application/ports/shifts.repository.port';
import type { NewShift, Shift } from '../../../../domain/shift';
import { ShiftEntity } from '../entities/shift.entity';
import { ShiftMapper } from '../mappers/shift.mapper';

@Injectable()
export class ShiftsRelationalRepository implements ShiftsRepository {
  constructor(private readonly db: DatabaseService) {}

  async insert(data: NewShift): Promise<Shift> {
    const row = await this.db.tenant((m) =>
      m.save(ShiftMapper.toPersistence(data)),
    );
    return ShiftMapper.toDomain(row);
  }

  async findAll(): Promise<Shift[]> {
    const rows = await this.db.tenant((m) =>
      m.find(ShiftEntity, { order: { name: 'ASC' } }),
    );
    return rows.map((row) => ShiftMapper.toDomain(row));
  }
}
