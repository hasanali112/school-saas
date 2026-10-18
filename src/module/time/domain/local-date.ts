/** Every date rule (attendance, leave, holidays) runs on the school's local calendar. */
export const LOCAL_TIME_ZONE = 'Asia/Dhaka';

const MONTH_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])$/;

export interface MonthBounds {
  /** First day of the month, ISO date. */
  from: string;
  /** Last day of the month, ISO date. */
  to: string;
}

/** Today's ISO date (YYYY-MM-DD) in Asia/Dhaka, whatever the server clock's zone is. */
export function todayLocal(now: Date = new Date()): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: LOCAL_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

export function isMonth(value: string): boolean {
  return MONTH_PATTERN.test(value);
}

/** `2026-02` → `{ from: '2026-02-01', to: '2026-02-28' }`. */
export function monthBounds(month: string): MonthBounds {
  const match = MONTH_PATTERN.exec(month);
  if (!match) throw new Error(`Invalid month: ${month}`);
  const year = Number(match[1]);
  const monthIndex = Number(match[2]);
  const lastDay = new Date(Date.UTC(year, monthIndex, 0)).getUTCDate();
  return {
    from: `${month}-01`,
    to: `${month}-${String(lastDay).padStart(2, '0')}`,
  };
}
