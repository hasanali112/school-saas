import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthUser } from '@modules/auth/auth-user';
import { isUniqueViolation } from '@database/database.errors';
import { AcademicSessionRow } from '@database/schema';
import { SessionResponseDto } from '../dto/academics.response.dto';
import { CreateSessionDto } from '../dto/create-session.dto';
import { SessionsRepository } from './sessions.repository';

@Injectable()
export class SessionsService {
  constructor(private readonly repo: SessionsRepository) {}

  async create(
    dto: CreateSessionDto,
    actor: AuthUser,
  ): Promise<SessionResponseDto> {
    if (dto.startsOn >= dto.endsOn)
      throw new BadRequestException('startsOn must be before endsOn');

    let row: AcademicSessionRow;
    try {
      row = await this.repo.insert({
        ...dto,
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
