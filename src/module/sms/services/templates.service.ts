import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AuthUser } from '@common/types/auth-user';
import { DEFAULT_TEMPLATES } from '../domain/default-templates';
import type { DefaultTemplateKey } from '../domain/default-templates';
import { isKnownMergeField } from '../domain/merge-fields';
import type { TemplateText } from '../domain/sms-template';
import { extractMergeFields } from '../domain/template-render';
import { UpsertTemplateDto } from '../dto/template.dto';
import { TemplateResponseDto } from '../dto/template.response.dto';
import { TemplatesRepository } from '../application/ports/templates.repository.port';

/** Institution overrides layered over the built-in set (F1-12 §2). */
@Injectable()
export class TemplatesService {
  constructor(private readonly repo: TemplatesRepository) {}

  /** The body to render for a key: custom first, then built in. */
  async resolve(key: string): Promise<string> {
    const custom = await this.repo.findByKey(key);
    const body = custom?.body ?? this.builtIn(key)?.body;
    if (body === undefined)
      throw new NotFoundException(`Template ${key} not found`);
    return body;
  }

  async list(): Promise<TemplateResponseDto[]> {
    const custom = await this.repo.findAll();
    const byKey = new Map(custom.map((row) => [row.key, row]));
    const builtIn = Object.entries(DEFAULT_TEMPLATES)
      .filter(([key]) => !byKey.has(key))
      .map(([key, t]) => TemplateResponseDto.builtIn(key, t.name, t.body));
    return [
      ...custom.map((row) => TemplateResponseDto.from(row)),
      ...builtIn,
    ].sort((a, b) => a.key.localeCompare(b.key));
  }

  async upsert(
    key: string,
    dto: UpsertTemplateDto,
    actor: AuthUser,
  ): Promise<TemplateResponseDto> {
    const unknown = extractMergeFields(dto.body).filter(
      (field) => !isKnownMergeField(field),
    );
    if (unknown.length)
      throw new BadRequestException(
        `Unknown merge fields: ${unknown.join(', ')}`,
      );
    const row = await this.repo.upsert({
      institutionId: actor.institutionId,
      key,
      name: dto.name,
      body: dto.body,
      updatedBy: actor.id,
    });
    return TemplateResponseDto.from(row);
  }

  /** Removing an override returns the key to its built-in body (if any). */
  async remove(key: string): Promise<void> {
    const removed = await this.repo.remove(key);
    if (!removed) throw new NotFoundException(`Template ${key} not found`);
  }

  private builtIn(key: string): TemplateText | undefined {
    return this.isDefaultKey(key) ? DEFAULT_TEMPLATES[key] : undefined;
  }

  private isDefaultKey(key: string): key is DefaultTemplateKey {
    return Object.hasOwn(DEFAULT_TEMPLATES, key);
  }
}
