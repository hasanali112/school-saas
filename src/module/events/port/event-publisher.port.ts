import { DomainEvent } from '../domain/domain-event';

export abstract class EventPublisherPort {
  /** Fire and forget: listeners catch their own errors, so a side effect never fails the request. */
  abstract publish(event: DomainEvent): void;
}
