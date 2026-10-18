import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  isForeignKeyViolation,
  isUniqueViolation,
} from '@common/services/database/database-errors';
import type { AuthUser } from '@module/auth/domain/auth-user';
import {
  GuardianChildDto,
  StudentGuardianResponseDto,
} from '../dto/guardian.response.dto';
import { LinkGuardianDto } from '../dto/link-guardian.dto';
import { GuardiansRepositoryPort } from '../port/guardians.repository.port';

@Injectable()
export class GuardiansService {
  constructor(private readonly repo: GuardiansRepositoryPort) {}

  async link(
    studentId: string,
    dto: LinkGuardianDto,
    actor: AuthUser,
  ): Promise<StudentGuardianResponseDto> {
    try {
      const { link, guardian } = await this.repo.link({
        phone: dto.phone,
        name: dto.name,
        relation: dto.relation,
        isPrimary: dto.isPrimary,
        studentId,
        institutionId: actor.institutionId,
      });
      return StudentGuardianResponseDto.from(link, guardian);
    } catch (error) {
      if (isUniqueViolation(error))
        throw new ConflictException(
          'Guardian is already linked to this student',
        );
      if (isForeignKeyViolation(error))
        throw new BadRequestException('Unknown student');
      throw error;
    }
  }

  async unlink(studentId: string, guardianId: string): Promise<void> {
    const removed = await this.repo.unlink(studentId, guardianId);
    if (!removed)
      throw new NotFoundException('Guardian is not linked to this student');
  }

  async listForStudent(
    studentId: string,
  ): Promise<StudentGuardianResponseDto[]> {
    const rows = await this.repo.findForStudent(studentId);
    return rows.map(({ link, guardian }) =>
      StudentGuardianResponseDto.from(link, guardian),
    );
  }

  async children(guardianId: string): Promise<GuardianChildDto[]> {
    const rows = await this.repo.findChildren(guardianId);
    return rows.map(({ link, student }) =>
      GuardianChildDto.from(link, student),
    );
  }
}
