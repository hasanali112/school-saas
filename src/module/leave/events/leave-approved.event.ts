import { DomainEvent } from '@shared/events/domain-event';

/** Consumed by routine repair (F3-03g) for staff and by attendance for students. */
export class LeaveApprovedEvent extends DomainEvent {
  static readonly NAME = 'leave.approved';
  readonly name = LeaveApprovedEvent.NAME;

  constructor(
    institutionId: string,
    readonly applicationId: string,
    readonly applicantKind: 'staff' | 'student',
    readonly applicantId: string,
    readonly fromDate: string,
    readonly toDate: string,
    readonly actorId: string,
  ) {
    super(institutionId);
  }
}
