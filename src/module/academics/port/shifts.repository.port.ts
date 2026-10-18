import type { NewShift, Shift } from '../domain/shift';

export abstract class ShiftsRepositoryPort {
  abstract insert(data: NewShift): Promise<Shift>;
  abstract findAll(): Promise<Shift[]>;
}
