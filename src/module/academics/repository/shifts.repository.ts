import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@common/services/database/database.service';
import type { NewShift, Shift } from '../domain/shift';
import { ShiftsRepositoryPort } from '../port/shifts.repository.port';
import { ShiftEntity } from './entities/shift.entity';

@Injectable()
export class ShiftsRepository implements ShiftsRepositoryPort {
  constructor(private readonly db: DatabaseService) {}

  insert(data: NewShift): Promise<Shift> {
    return this.db.tenant((m) => m.save(m.create(ShiftEntity, data)));
  }

  findAll(): Promise<Shift[]> {
    return this.db.tenant((m) =>
      m.find(ShiftEntity, { order: { name: 'ASC' } }),
    );
  }
}
