import { Injectable } from '@nestjs/common';
import type { AuthUser } from '@common/types/auth-user';
import { UpsertTemplateDto } from '../dto/template.dto';
import { TemplateResponseDto } from '../dto/template.response.dto';
import { TemplatesService } from './templates.service';

@Injectable()
export class TemplatesFacade {
  constructor(private readonly templates: TemplatesService) {}

  list(): Promise<TemplateResponseDto[]> {
    return this.templates.list();
  }

  upsert(
    key: string,
    dto: UpsertTemplateDto,
    actor: AuthUser,
  ): Promise<TemplateResponseDto> {
    return this.templates.upsert(key, dto, actor);
  }

  remove(key: string): Promise<void> {
    return this.templates.remove(key);
  }
}
