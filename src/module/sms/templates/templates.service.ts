import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthUser } from '@modules/auth/auth-user';
import { UpsertTemplateDto } from '../dto/template.dto';
import { TemplateResponseDto } from '../dto/template.response.dto';
import { DEFAULT_TEMPLATES } from './default-templates';
import { isKnownMergeField } from './merge-fields';
import { extractMergeFields } from './template-render';
import { TemplatesRepository } from './templates.repository';

const defaults = DEFAULT_TEMPLATES as Record<
  string,
  { readonly name: string; readonly body: string } | undefined
>;

/** Institution overrides layered over the built-in set (F1-12 §2). */
@Injectable()
export class TemplatesService {
  constructor(private readonly repo: TemplatesRepository) {}

  /** The body to render for a key: custom first, then built in. */
  async resolve(key: string): Promise<string> {
    const custom = await this.repo.findByKey(key);
    const body = custom?.body ?? defaults[key]?.body;
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
}
