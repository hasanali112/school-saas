import { DomainEvent } from '@shared/events/domain-event';

export class UserCreatedEvent extends DomainEvent {
  static readonly NAME = 'user.created';
  readonly name = UserCreatedEvent.NAME;

  constructor(
    institutionId: string,
    readonly userId: string,
    readonly actorId: string,
  ) {
    super(institutionId);
  }
}
