import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AttendanceMarkedEvent } from '@modules/attendance/events/attendance-marked.event';
import { BatchesService } from '../batches/batches.service';

export const ABSENCE_TEMPLATE_KEY = 'absence';

/**
 * F1-05 §5 / F1-12 §4: every marking that produced absentees becomes a draft absence
 * batch for the office to preview and send. Drafting, never sending: cost before send.
 */
@Injectable()
export class AbsenceSmsListener {
  private readonly logger = new Logger(AbsenceSmsListener.name);

  constructor(private readonly batches: BatchesService) {}

  @OnEvent(AttendanceMarkedEvent.NAME, { promisify: true })
  async onAttendanceMarked(event: AttendanceMarkedEvent): Promise<void> {
    if (event.absentStudentIds.length === 0) return;
    try {
      await this.batches.draftForSystem({
        institutionId: event.institutionId,
        purpose: 'absence',
        templateKey: ABSENCE_TEMPLATE_KEY,
        audience: { studentIds: [...event.absentStudentIds] },
        dedupeKey: `absence:${event.sectionId}:${event.date}:${event.period}`,
      });
    } catch (error) {
      // Attendance is already saved; a missing draft is recoverable, a failed marking is not.
      this.logger.error(
        `Absence SMS draft failed for section ${event.sectionId} on ${event.date}`,
        (error as Error).stack,
      );
    }
  }
}
