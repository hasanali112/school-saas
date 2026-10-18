import { Injectable } from '@nestjs/common';
import type { AuthUser } from '@module/auth/domain/auth-user';
import { SessionResponseDto } from '../dto/academics.response.dto';
import { CreateSessionDto } from '../dto/create-session.dto';
import { SessionsService } from './sessions.service';

@Injectable()
export class SessionsFacade {
  constructor(private readonly sessions: SessionsService) {}

  create(dto: CreateSessionDto, actor: AuthUser): Promise<SessionResponseDto> {
    return this.sessions.create(dto, actor);
  }

  list(): Promise<SessionResponseDto[]> {
    return this.sessions.list();
  }

  getById(id: string): Promise<SessionResponseDto> {
    return this.sessions.getById(id);
  }

  setCurrent(id: string): Promise<SessionResponseDto> {
    return this.sessions.setCurrent(id);
  }
}
