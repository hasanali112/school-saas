import { Global, Module } from '@nestjs/common';
import { SystemClock } from './infrastructure/adapters/system.clock';
import { ClockPort } from './application/ports/clock.port';

/** Shared kernel: every module can inject `ClockPort` without importing this module. */
@Global()
@Module({
  providers: [{ provide: ClockPort, useClass: SystemClock }],
  exports: [ClockPort],
})
export class TimeModule {}
