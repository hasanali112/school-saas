import { Body, Controller, Get, Patch } from '@nestjs/common';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import type { AuthUser } from '@modules/auth/auth-user';
import { Role } from '@modules/auth/roles';
import { InstitutionResponseDto } from './dto/institution.response.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';
import { InstitutionsService } from './institutions.service';

/** Singular route: a principal only ever sees its own institution. */
@Controller('institution')
export class InstitutionsController {
  constructor(private readonly institutions: InstitutionsService) {}

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
