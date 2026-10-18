import { Injectable } from '@nestjs/common';
import type { AuthUser } from '@module/auth/domain/auth-user';
import {
  GuardianChildDto,
  StudentGuardianResponseDto,
} from '../dto/guardian.response.dto';
import { LinkGuardianDto } from '../dto/link-guardian.dto';
import { GuardiansService } from './guardians.service';

@Injectable()
export class GuardiansFacade {
  constructor(private readonly guardians: GuardiansService) {}

  link(
    studentId: string,
    dto: LinkGuardianDto,
    actor: AuthUser,
  ): Promise<StudentGuardianResponseDto> {
    return this.guardians.link(studentId, dto, actor);
  }

  unlink(studentId: string, guardianId: string): Promise<void> {
    return this.guardians.unlink(studentId, guardianId);
  }

  listForStudent(studentId: string): Promise<StudentGuardianResponseDto[]> {
    return this.guardians.listForStudent(studentId);
  }

  children(guardianId: string): Promise<GuardianChildDto[]> {
    return this.guardians.children(guardianId);
  }
}
