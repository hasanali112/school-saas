/** The clock services read instead of `new Date()`, so date rules can be tested. */
export abstract class ClockPort {
  /** Today's ISO date in the school's time zone (Asia/Dhaka). */
  abstract today(): string;
  abstract now(): Date;
}
