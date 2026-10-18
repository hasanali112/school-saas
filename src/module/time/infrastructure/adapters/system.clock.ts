import { Injectable } from '@nestjs/common';
import { todayLocal } from '../../domain/local-date';
import { ClockPort } from '../../application/ports/clock.port';

@Injectable()
export class SystemClock implements ClockPort {
  today(): string {
    return todayLocal(this.now());
  }

  now(): Date {
    return new Date();
  }
}
