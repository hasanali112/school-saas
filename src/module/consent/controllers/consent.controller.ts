import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
} from '@nestjs/common';
import { CurrentUser } from '@module/auth/decorators/current-user.decorator';
import { Roles } from '@module/auth/decorators/roles.decorator';
import type { AuthUser } from '@module/auth/domain/auth-user';
import { Role } from '@module/auth/domain/role';
import { ConsentFacade } from '../services/consent.facade';
import { RecordConsentDto } from '../dto/consent.dto';
import { ConsentResponseDto } from '../dto/consent.response.dto';

const CONSENT_READERS = [
  Role.InstituteHead,
  Role.AdminOfficer,
  Role.DataProtectionContact,
  Role.ClassTeacher,
];
const CONSENT_WRITERS = [
  Role.InstituteHead,
  Role.AdminOfficer,
  Role.DataProtectionContact,
];

@Controller('guardians/:guardianId/consents')
export class ConsentController {
  constructor(private readonly consent: ConsentFacade) {}

  @Get()
  @Roles(CONSENT_READERS)
  list(
    @Param('guardianId', ParseUUIDPipe) guardianId: string,
  ): Promise<ConsentResponseDto[]> {
    return this.consent.list(guardianId);
  }

  /** Idempotent per purpose: PUT the latest decision. */
  @Put()
  @Roles(CONSENT_WRITERS)
  record(
    @Param('guardianId', ParseUUIDPipe) guardianId: string,
    @Body() dto: RecordConsentDto,
    @CurrentUser() actor: AuthUser,
  ): Promise<ConsentResponseDto> {
    return this.consent.record(guardianId, dto, actor);
  }
}
