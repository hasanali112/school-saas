import { DomainEvent } from '@module/events/domain/domain-event';

export class StudentExitedEvent extends DomainEvent {
  static readonly NAME = 'student.exited';
  readonly name = StudentExitedEvent.NAME;

  constructor(
    institutionId: string,
    readonly studentId: string,
    readonly actorId: string,
    readonly reason: string,
  ) {
    super(institutionId);
  }
}
