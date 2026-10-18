import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DomainEvent } from '../domain/domain-event';
import { EventPublisherPort } from '../port/event-publisher.port';

@Injectable()
export class EventEmitterPublisher implements EventPublisherPort {
  constructor(private readonly emitter: EventEmitter2) {}

  publish(event: DomainEvent): void {
    this.emitter.emit(event.name, event);
  }
}
