import type { SmsTemplate } from '../domain/sms-template';
import { extractMergeFields } from '../domain/template-render';

export class TemplateResponseDto {
  readonly mergeFields: string[];

  private constructor(
    readonly key: string,
    readonly name: string,
    readonly body: string,
    readonly isCustom: boolean,
    readonly updatedAt: Date | null,
  ) {
    this.mergeFields = extractMergeFields(body);
  }

  static from(row: SmsTemplate): TemplateResponseDto {
    return new TemplateResponseDto(
      row.key,
      row.name,
      row.body,
      true,
      row.updatedAt,
    );
  }

  static builtIn(key: string, name: string, body: string): TemplateResponseDto {
    return new TemplateResponseDto(key, name, body, false, null);
  }
}
