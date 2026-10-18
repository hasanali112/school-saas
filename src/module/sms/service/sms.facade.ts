import { Injectable } from '@nestjs/common';
import type { SmsDelivery } from '../domain/sms';
import { BatchResponseDto } from '../dto/batch.response.dto';
import { BatchesService, SystemDraftInput } from './batches.service';
import { SmsService } from './sms.service';

/** What other modules may do with SMS: send a transactional message, or draft a guardian notice. */
@Injectable()
export class SmsFacade {
  constructor(
    private readonly sms: SmsService,
    private readonly batches: BatchesService,
  ) {}

  /** OTPs only: sent at once, no consent check, no draft (CLAUDE.md, SMS). */
  sendTransactional(phone: string, message: string): Promise<SmsDelivery> {
    return this.sms.send(phone, message);
  }

  /** Guardian-facing notices: drafted with a cost preview for the office to send. */
  draftForSystem(
    input: SystemDraftInput,
  ): Promise<BatchResponseDto | undefined> {
    return this.batches.draftForSystem(input);
  }
}
