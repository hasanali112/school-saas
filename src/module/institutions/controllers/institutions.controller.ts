import { Body, Controller, Get, Patch } from '@nestjs/common';
import { CurrentUser } from '@module/auth/decorators/current-user.decorator';
import { Roles } from '@module/auth/decorators/roles.decorator';
import type { AuthUser } from '@module/auth/domain/auth-user';
import { Role } from '@module/auth/domain/role';
import { InstitutionResponseDto } from '../dto/institution.response.dto';
import { UpdateInstitutionDto } from '../dto/update-institution.dto';
import { InstitutionsFacade } from '../services/institutions.facade';

/** Singular route: a principal only ever sees its own institution. */
@Controller('institution')
export class InstitutionsController {
  constructor(private readonly institutions: InstitutionsFacade) {}

  @Get()
  getCurrent(): Promise<InstitutionResponseDto> {
    return this.institutions.getCurrent();
  }

  @Patch()
  @Roles([Role.InstituteHead, Role.AdminOfficer])
  update(
    @Body() dto: UpdateInstitutionDto,
    @CurrentUser() actor: AuthUser,
  ): Promise<InstitutionResponseDto> {
    return this.institutions.updateCurrent(dto, actor);
  }
}
