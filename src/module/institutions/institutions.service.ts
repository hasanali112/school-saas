import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthUser } from '@modules/auth/auth-user';
import { isUniqueViolation } from '@database/database.errors';
import { InstitutionResponseDto } from './dto/institution.response.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';
import { InstitutionsRepository } from './institutions.repository';

@Injectable()
export class InstitutionsService {
  constructor(private readonly repo: InstitutionsRepository) {}

  async getCurrent(): Promise<InstitutionResponseDto> {
    const row = await this.repo.findCurrent();
    if (!row) throw new NotFoundException('Institution not found');
    return InstitutionResponseDto.from(row);
  }

  async updateCurrent(
    dto: UpdateInstitutionDto,
    actor: AuthUser,
  ): Promise<InstitutionResponseDto> {
    const row = await this.repo.updateCurrent(actor.institutionId, dto);
    if (!row) throw new NotFoundException('Institution not found');
    return InstitutionResponseDto.from(row);

    if (isUniqueViolation(error))
      throw new ConflictException('EIIN is already registered');
  }
}
