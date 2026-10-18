import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { isUniqueViolation } from '@common/services/database/database-errors';
import type { AuthUser } from '@module/auth/domain/auth-user';
import type { Institution } from '../domain/institution';
import { InstitutionResponseDto } from '../dto/institution.response.dto';
import { UpdateInstitutionDto } from '../dto/update-institution.dto';
import { InstitutionsRepositoryPort } from '../port/institutions.repository.port';

@Injectable()
export class InstitutionsService {
  constructor(private readonly repo: InstitutionsRepositoryPort) {}

  async getCurrent(): Promise<InstitutionResponseDto> {
    const row = await this.repo.findCurrent();
    if (!row) throw new NotFoundException('Institution not found');
    return InstitutionResponseDto.from(row);
  }

  async updateCurrent(
    dto: UpdateInstitutionDto,
    actor: AuthUser,
  ): Promise<InstitutionResponseDto> {
    let row: Institution | undefined;
    try {
      row = await this.repo.updateCurrent(actor.institutionId, dto);
    } catch (error) {
      if (isUniqueViolation(error))
        throw new ConflictException('EIIN is already registered');
      throw error;
    }
    if (!row) throw new NotFoundException('Institution not found');
    return InstitutionResponseDto.from(row);
  }
}
