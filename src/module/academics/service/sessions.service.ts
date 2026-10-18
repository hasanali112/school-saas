import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { isUniqueViolation } from '@common/services/database/database-errors';
import type { AuthUser } from '@module/auth/domain/auth-user';
import type { AcademicSession } from '../domain/academic-session';
import { SessionResponseDto } from '../dto/academics.response.dto';
import { CreateSessionDto } from '../dto/create-session.dto';
import { SessionsRepositoryPort } from '../port/sessions.repository.port';

@Injectable()
export class SessionsService {
  constructor(private readonly repo: SessionsRepositoryPort) {}

  async create(
    dto: CreateSessionDto,
    actor: AuthUser,
  ): Promise<SessionResponseDto> {
    if (dto.startsOn >= dto.endsOn)
      throw new BadRequestException('startsOn must be before endsOn');

    let row: AcademicSession;
    try {
      row = await this.repo.insert({
        name: dto.name,
        startsOn: dto.startsOn,
        endsOn: dto.endsOn,
        isCurrent: dto.isCurrent ?? false,
        institutionId: actor.institutionId,
      });
    } catch (error) {
      if (isUniqueViolation(error))
        throw new ConflictException(`Session ${dto.name} already exists`);
      throw error;
    }
    return SessionResponseDto.from(row);
  }

  async list(): Promise<SessionResponseDto[]> {
    return SessionResponseDto.fromMany(await this.repo.findAll());
  }

  async getById(id: string): Promise<SessionResponseDto> {
    const row = await this.repo.findById(id);
    if (!row) throw new NotFoundException(`Session ${id} not found`);
    return SessionResponseDto.from(row);
  }

  /** Resolves an explicit session id or falls back to the current one; fails clearly when neither exists. */
  async resolveId(sessionId?: string): Promise<string> {
    if (sessionId) return sessionId;
    const current = await this.repo.findCurrentId();
    if (!current)
      throw new BadRequestException('No current session; pass sessionId');
    return current;
  }

  async setCurrent(id: string): Promise<SessionResponseDto> {
    const row = await this.repo.setCurrent(id);
    if (!row) throw new NotFoundException(`Session ${id} not found`);
    return SessionResponseDto.from(row);
  }
}
