import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { todayLocal } from '@shared/time/local-date';
import { AuthUser } from '@modules/auth/auth-user';
import { paginate, Paginated } from '@common/types/paginated';
import { SmsBatchRow, SmsMessageRow } from '@database/schema';
import { SessionsService } from '@modules/academics/sessions/sessions.service';
import { InstitutionsService } from '@modules/institutions/institutions.service';
import { AuditService } from '@shared/audit/audit.service';
import { AudienceService } from '../audience/audience.service';
import { BalanceService } from '../balance/balance.service';
import { AudienceDto } from '../dto/audience.dto';
import {
  BatchResponseDto,
  MessageResponseDto,
  PreviewDto,
} from '../dto/batch.response.dto';
import { ComposeDto, ListBatchesQueryDto } from '../dto/compose.dto';
import { SMS_GATEWAY } from '../gateway/sms.gateway';
import type { SmsGateway } from '../gateway/sms.gateway';
import { countSegments, SmsEncoding } from '../segments';
import {
  MergeValues,
  MissingMergeFieldsError,
  renderTemplate,
} from '../templates/template-render';
import { TemplatesService } from '../templates/templates.service';
import {
  BatchesRepository,
  DraftMessage,
  MessageResult,
} from './batches.repository';

export interface SystemDraftInput {
  institutionId: string;
  purpose: SmsBatchRow['purpose'];
  templateKey: string;
  audience: AudienceDto;
  dedupeKey: string;
  sessionId?: string;
}

interface Composition {
  body: string;
  messages: DraftMessage[];
  preview: PreviewDto;
}

/**
 * The SMS composer (F1-12 §2): preview → draft → send. A draft carries its own
 * cost, so what the office confirmed is exactly what gets charged.
 */
@Injectable()
export class BatchesService {
  constructor(
    private readonly repo: BatchesRepository,
    private readonly audience: AudienceService,
    private readonly templates: TemplatesService,
    private readonly balance: BalanceService,
    private readonly sessions: SessionsService,
    private readonly institutions: InstitutionsService,
    private readonly audit: AuditService,
    @Inject(SMS_GATEWAY) private readonly gateway: SmsGateway,
  ) {}

  async preview(dto: ComposeDto): Promise<PreviewDto> {
    const { preview } = await this.compose(dto);
    return preview;
  }

  async create(dto: ComposeDto, actor: AuthUser): Promise<BatchResponseDto> {
    const { body, messages, preview } = await this.compose(dto);
    const row = await this.repo.insertDraft(
      {
        institutionId: actor.institutionId,
        purpose: dto.purpose,
        templateKey: dto.templateKey ?? null,
        body,
        dedupeKey: null,
        recipientCount: preview.recipientCount,
        segmentCount: preview.segmentCount,
        costPaisa: preview.costPaisa,
        createdBy: actor.id,
      },
      messages,
    );
    return BatchResponseDto.from(row, preview);
  }

  /**
   * Drafts on behalf of a module (absence SMS). Keyed so re-marking the same
   * section-day replaces the draft instead of adding another; a sent batch stays.
   */
  async draftForSystem(
    input: SystemDraftInput,
  ): Promise<BatchResponseDto | undefined> {
    const existing = await this.repo.findByDedupeKey(input.dedupeKey);
    if (existing && existing.status !== 'draft') return undefined;

    const { body, messages, preview } = await this.compose(
      {
        templateKey: input.templateKey,
        audience: input.audience,
        sessionId: input.sessionId,
      },
      { allowEmpty: true },
    );
    if (messages.length === 0) return undefined;

    if (existing) await this.repo.deleteDraft(existing.id);
    const row = await this.repo.insertDraft(
      {
        institutionId: input.institutionId,
        purpose: input.purpose,
        templateKey: input.templateKey,
        body,
        dedupeKey: input.dedupeKey,
        recipientCount: preview.recipientCount,
        segmentCount: preview.segmentCount,
        costPaisa: preview.costPaisa,
        createdBy: null,
      },
      messages,
    );
    return BatchResponseDto.from(row, preview);
  }

  async send(id: string, actor: AuthUser): Promise<BatchResponseDto> {
    const batch = await this.requireDraft(id);
    const sending = await this.repo.markSending(id);
    if (!sending) throw new ConflictException('Batch is already being sent');

    try {
      await this.balance.charge(id, batch.costPaisa, actor.id);
    } catch (error) {
      await this.repo.revertToDraft(id);
      throw error;
    }

    const messages = await this.repo.findMessages(id);
    const results = await Promise.all(messages.map((message) => this.dispatch(message)));
    await this.repo.recordResults(results);

    const failed = results.filter((r) => r.status === 'failed');
    const failedCost = failed.reduce(
      (sum, r) => sum + messages.find((m) => m.id === r.id)!.costPaisa,
      0,
    );
    await this.balance.refund(id, failedCost);

    const sentCount = results.length - failed.length;
    const finished = await this.repo.finish(id, {
      status: sentCount > 0 ? 'sent' : 'failed',
      sentCount,
      failedCount: failed.length,
      sentBy: actor.id,
    });
    await this.audit.record({
      actorId: actor.id,
      action: 'sms.batch.sent',
      entity: 'sms_batch',
      entityId: id,
      after: {
        purpose: batch.purpose,
        recipientCount: batch.recipientCount,
        sentCount,
        failedCount: failed.length,
        costPaisa: batch.costPaisa,
        refundedPaisa: failedCost,
      },
    });
    return BatchResponseDto.from(finished ?? { ...batch, status: 'sent' });
  }

  async cancel(id: string): Promise<BatchResponseDto> {
    await this.requireDraft(id);
    const row = await this.repo.cancel(id);
    if (!row) throw new ConflictException('Batch is no longer a draft');
    return BatchResponseDto.from(row);
  }

  async list(query: ListBatchesQueryDto): Promise<Paginated<BatchResponseDto>> {
    const { rows, total } = await this.repo.findPage(
      { status: query.status, purpose: query.purpose },
      query.limit,
      query.offset,
    );
    return paginate(
      BatchResponseDto.fromMany(rows),
      total,
      query.page,
      query.limit,
    );
  }

  async get(id: string): Promise<BatchResponseDto> {
    return BatchResponseDto.from(await this.requireBatch(id));
  }

  async messages(id: string): Promise<MessageResponseDto[]> {
    await this.requireBatch(id);
    return MessageResponseDto.fromMany(await this.repo.findMessages(id));
  }

  private async compose(
    dto: Pick<ComposeDto, 'message' | 'templateKey' | 'audience' | 'sessionId'>,
    options: { allowEmpty?: boolean } = {},
  ): Promise<Composition> {
    if (!dto.message === !dto.templateKey)
      throw new BadRequestException(
        'Provide exactly one of message and templateKey',
      );
    const [body, sessionId] = await Promise.all([
      dto.templateKey ? this.templates.resolve(dto.templateKey) : dto.message!,
      this.sessions.resolveId(dto.sessionId),
    ]);
    const [resolved, institution, balance] = await Promise.all([
      this.audience.resolve(dto.audience, sessionId),
      this.institutions.getCurrent(),
      this.balance.get(),
    ]);
    if (resolved.recipients.length === 0 && !options.allowEmpty)
      throw new BadRequestException(
        `No recipients (${resolved.excluded.noConsent} excluded for missing SMS consent)`,
      );

    const shared = { date: todayLocal(), institutionName: institution.nameBn };
    const seen = new Set<string>();
    const messages: DraftMessage[] = [];
    let encoding: SmsEncoding = 'gsm7';
    for (const recipient of resolved.recipients) {
      const text = this.render(body, { ...shared, ...recipient.fields });
      const key = `${recipient.phone}\n${text}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const count = countSegments(text);
      if (count.encoding === 'unicode') encoding = 'unicode';
      messages.push({
        phone: recipient.phone,
        guardianId: recipient.guardianId ?? null,
        studentId: recipient.studentId ?? null,
        body: text,
        segments: count.segments,
        costPaisa: count.segments * balance.ratePaisaPerSegment,
      });
    }

    const segmentCount = messages.reduce((sum, m) => sum + m.segments, 0);
    const costPaisa = segmentCount * balance.ratePaisaPerSegment;
    return {
      body,
      messages,
      preview: {
        recipientCount: messages.length,
        segmentCount,
        costPaisa,
        balancePaisa: balance.balancePaisa,
        shortfallPaisa: Math.max(0, costPaisa - balance.balancePaisa),
        encoding,
        excluded: resolved.excluded,
        sample: messages[0]?.body ?? '',
      },
    };
  }

  private async dispatch(message: SmsMessageRow): Promise<MessageResult> {
    try {
      const delivery = await this.gateway.send(message.phone, message.body);
      return {
        id: message.id,
        status: 'sent',
        gateway: delivery.gateway,
        providerMessageId: delivery.providerMessageId ?? null,
        error: null,
      };
    } catch (error) {
      return {
        id: message.id,
        status: 'failed',
        gateway: null,
        providerMessageId: null,
        error: error instanceof Error ? error.message : 'Delivery failed',
      };
    }
  }

  private async requireBatch(id: string): Promise<SmsBatchRow> {
    const row = await this.repo.findById(id);
    if (!row) throw new NotFoundException(`SMS batch ${id} not found`);
    return row;
  }

  private async requireDraft(id: string): Promise<SmsBatchRow> {
    const row = await this.requireBatch(id);
    if (row.status !== 'draft')
      throw new ConflictException(`Batch is already ${row.status}`);
    return row;
  }

  private render(body: string, values: MergeValues): string {
    try {
      return renderTemplate(body, values);
    } catch (error) {
      if (error instanceof MissingMergeFieldsError)
        throw new BadRequestException(
          `This audience cannot fill: ${error.fields.join(', ')}`,
        );
      throw error;
    }
  }
}
