/** Base of every event a module publishes; subclasses live in `<module>/events/`. */
export abstract class DomainEvent {
  abstract readonly name: string;
  readonly occurredAt = new Date();

  constructor(readonly institutionId: string) {}
}
