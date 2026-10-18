import { Injectable } from '@nestjs/common';
import type { AuthUser } from '@module/auth/domain/auth-user';
import { InstitutionResponseDto } from '../dto/institution.response.dto';
import { UpdateInstitutionDto } from '../dto/update-institution.dto';
import { InstitutionsService } from './institutions.service';

@Injectable()
export class InstitutionsFacade {
  constructor(private readonly institutions: InstitutionsService) {}

  getCurrent(): Promise<InstitutionResponseDto> {
    return this.institutions.getCurrent();
  }

  updateCurrent(
    dto: UpdateInstitutionDto,
    actor: AuthUser,
  ): Promise<InstitutionResponseDto> {
    return this.institutions.updateCurrent(dto, actor);
  }
}
