import { Global, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventEmitterPublisher } from './adapter/event-emitter.publisher';
import { EventPublisherPort } from './port/event-publisher.port';

/** Shared kernel: `EventPublisherPort` over `@nestjs/event-emitter`. */
@Global()
@Module({
  imports: [EventEmitterModule.forRoot()],
  providers: [{ provide: EventPublisherPort, useClass: EventEmitterPublisher }],
  exports: [EventPublisherPort],
})
export class EventsModule {}
