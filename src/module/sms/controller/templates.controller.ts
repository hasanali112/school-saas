import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
} from '@nestjs/common';
import { CurrentUser } from '@module/auth/decorators/current-user.decorator';
import { Roles } from '@module/auth/decorators/roles.decorator';
import type { AuthUser } from '@module/auth/domain/auth-user';
import { TemplateKeyDto, UpsertTemplateDto } from '../dto/template.dto';
import { TemplateResponseDto } from '../dto/template.response.dto';
import { SMS_OPERATORS } from './sms-roles';
import { MERGE_FIELDS } from '../domain/merge-fields';
import { TemplatesFacade } from '../service/templates.facade';

@Controller('sms/templates')
@Roles(SMS_OPERATORS)
export class TemplatesController {
  constructor(private readonly templates: TemplatesFacade) {}

  @Get()
  list(): Promise<TemplateResponseDto[]> {
    return this.templates.list();
  }

  /** The placeholders a template may use, with a label for the composer UI. */
  @Get('merge-fields')
  mergeFields(): typeof MERGE_FIELDS {
    return MERGE_FIELDS;
  }

  @Put(':key')
  upsert(
    @Param() { key }: TemplateKeyDto,
    @Body() dto: UpsertTemplateDto,
    @CurrentUser() actor: AuthUser,
  ): Promise<TemplateResponseDto> {
    return this.templates.upsert(key, dto, actor);
  }

  @Delete(':key')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param() { key }: TemplateKeyDto): Promise<void> {
    return this.templates.remove(key);
  }
}
