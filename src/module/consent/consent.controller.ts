import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
} from '@nestjs/common';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import type { AuthUser } from '@modules/auth/auth-user';
import { Role } from '@modules/auth/roles';
import { ConsentService } from './consent.service';
import { RecordConsentDto } from './dto/consent.dto';
import { ConsentResponseDto } from './dto/consent.response.dto';

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
  constructor(private readonly consent: ConsentService) {}

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
