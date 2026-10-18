import { DomainEvent } from '@shared/events/domain-event';

export class StudentCreatedEvent extends DomainEvent {
  static readonly NAME = 'student.created';
  readonly name = StudentCreatedEvent.NAME;

  constructor(
    institutionId: string,
    readonly studentId: string,
    readonly actorId: string,
  ) {
    super(institutionId);
  }
}
