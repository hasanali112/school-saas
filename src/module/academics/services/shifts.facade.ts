import { Injectable } from '@nestjs/common';
import type { AuthUser } from '@common/types/auth-user';
import { ShiftResponseDto } from '../dto/academics.response.dto';
import { CreateShiftDto } from '../dto/create-shift.dto';
import { ShiftsService } from './shifts.service';

@Injectable()
export class ShiftsFacade {
  constructor(private readonly shifts: ShiftsService) {}

  create(dto: CreateShiftDto, actor: AuthUser): Promise<ShiftResponseDto> {
    return this.shifts.create(dto, actor);
  }

  list(): Promise<ShiftResponseDto[]> {
    return this.shifts.list();
  }
}
