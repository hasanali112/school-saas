import { ConflictException, Injectable } from '@nestjs/common';
import { isUniqueViolation } from '@common/services/database/database-errors';
import type { AuthUser } from '@module/auth/domain/auth-user';
import type { Shift } from '../domain/shift';
import { ShiftResponseDto } from '../dto/academics.response.dto';
import { CreateShiftDto } from '../dto/create-shift.dto';
import { ShiftsRepositoryPort } from '../port/shifts.repository.port';

@Injectable()
export class ShiftsService {
  constructor(private readonly repo: ShiftsRepositoryPort) {}

  async create(
    dto: CreateShiftDto,
    actor: AuthUser,
  ): Promise<ShiftResponseDto> {
    let row: Shift;
    try {
      row = await this.repo.insert({
        name: dto.name,
        institutionId: actor.institutionId,
      });
    } catch (error) {
      if (isUniqueViolation(error))
        throw new ConflictException(`Shift ${dto.name} already exists`);
      throw error;
    }
    return ShiftResponseDto.from(row);
  }

  async list(): Promise<ShiftResponseDto[]> {
    return ShiftResponseDto.fromMany(await this.repo.findAll());
  }
}
