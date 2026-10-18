import type { AudienceExclusions } from '../domain/audience';
import { SmsEncoding } from '../domain/segments';
import { SmsBatchStatus, SmsMessageStatus, SmsPurpose } from '../domain/sms';
import type { SmsBatch, SmsMessage } from '../domain/sms-batch';

export interface PreviewDto {
  recipientCount: number;
  segmentCount: number;
  costPaisa: number;
  balancePaisa: number;
  shortfallPaisa: number;
  encoding: SmsEncoding;
  excluded: AudienceExclusions;
  /** The first rendered message, so the office sees what a guardian will read. */
  sample: string;
}

export class BatchResponseDto {
  readonly id: string;
  readonly purpose: SmsPurpose;
  readonly status: SmsBatchStatus;
  readonly templateKey: string | null;
  readonly body: string;
  readonly recipientCount: number;
  readonly segmentCount: number;
  readonly costPaisa: number;
  readonly sentCount: number;
  readonly failedCount: number;
  readonly createdBy: string | null;
  readonly sentBy: string | null;
  readonly sentAt: Date | null;
  readonly createdAt: Date;
  readonly preview?: PreviewDto;

  private constructor(row: SmsBatch, preview?: PreviewDto) {
    this.id = row.id;
    this.purpose = row.purpose;
    this.status = row.status;
    this.templateKey = row.templateKey;
    this.body = row.body;
    this.recipientCount = row.recipientCount;
    this.segmentCount = row.segmentCount;
    this.costPaisa = row.costPaisa;
    this.sentCount = row.sentCount;
    this.failedCount = row.failedCount;
    this.createdBy = row.createdBy;
    this.sentBy = row.sentBy;
    this.sentAt = row.sentAt;
    this.createdAt = row.createdAt;
    if (preview) this.preview = preview;
  }

  static from(row: SmsBatch, preview?: PreviewDto): BatchResponseDto {
    return new BatchResponseDto(row, preview);
  }

  static fromMany(rows: readonly SmsBatch[]): BatchResponseDto[] {
    return rows.map((row) => BatchResponseDto.from(row));
  }
}

export class MessageResponseDto {
  readonly id: string;
  readonly phone: string;
  readonly guardianId: string | null;
  readonly studentId: string | null;
  readonly body: string;
  readonly segments: number;
  readonly costPaisa: number;
  readonly status: SmsMessageStatus;
  readonly gateway: string | null;
  readonly providerMessageId: string | null;
  readonly error: string | null;
  readonly sentAt: Date | null;
  readonly deliveredAt: Date | null;

  private constructor(row: SmsMessage) {
    this.id = row.id;
    this.phone = row.phone;
    this.guardianId = row.guardianId;
    this.studentId = row.studentId;
    this.body = row.body;
    this.segments = row.segments;
    this.costPaisa = row.costPaisa;
    this.status = row.status;
    this.gateway = row.gateway;
    this.providerMessageId = row.providerMessageId;
    this.error = row.error;
    this.sentAt = row.sentAt;
    this.deliveredAt = row.deliveredAt;
  }

  static fromMany(rows: readonly SmsMessage[]): MessageResponseDto[] {
    return rows.map((row) => new MessageResponseDto(row));
  }
}
