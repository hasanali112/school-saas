import { Injectable } from '@nestjs/common';
import type { AuthUser } from '@module/auth/domain/auth-user';
import { RecordConsentDto } from '../dto/consent.dto';
import { ConsentResponseDto } from '../dto/consent.response.dto';
import { ConsentService } from './consent.service';

@Injectable()
export class ConsentFacade {
  constructor(private readonly consent: ConsentService) {}

  list(guardianId: string): Promise<ConsentResponseDto[]> {
    return this.consent.list(guardianId);
  }

  record(
    guardianId: string,
    dto: RecordConsentDto,
    actor: AuthUser,
  ): Promise<ConsentResponseDto> {
    return this.consent.record(guardianId, dto, actor);
  }
}
