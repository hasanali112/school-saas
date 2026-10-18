import { ConflictException, Injectable } from '@nestjs/common';
import { AuthUser } from '@modules/auth/auth-user';
import { isUniqueViolation } from '@database/database.errors';
import { ShiftRow } from '@database/schema';
import { ShiftResponseDto } from '../dto/academics.response.dto';
import { CreateShiftDto } from '../dto/create-shift.dto';
import { ShiftsRepository } from './shifts.repository';

@Injectable()
export class ShiftsService {
  constructor(private readonly repo: ShiftsRepository) {}

  async create(
    dto: CreateShiftDto,
    actor: AuthUser,
  ): Promise<ShiftResponseDto> {
    let row: ShiftRow;
    try {
      row = await this.repo.insert({
        ...dto,
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
