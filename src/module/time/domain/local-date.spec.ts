import { isMonth, monthBounds, todayLocal } from './local-date';

describe('local-date', () => {
  it('uses the Dhaka calendar day, not the server one', () => {
    // 20:30 UTC is already the next day in Dhaka (UTC+6).
    expect(todayLocal(new Date('2026-03-01T20:30:00Z'))).toBe('2026-03-02');
    expect(todayLocal(new Date('2026-03-01T10:00:00Z'))).toBe('2026-03-01');
  });

  it('computes month bounds including leap years', () => {
    expect(monthBounds('2028-02')).toEqual({
      from: '2028-02-01',
      to: '2028-02-29',
    });
    expect(monthBounds('2026-12')).toEqual({
      from: '2026-12-01',
      to: '2026-12-31',
    });
  });

  it('validates the month format', () => {
    expect(isMonth('2026-13')).toBe(false);
    expect(isMonth('2026-07')).toBe(true);
    expect(() => monthBounds('July')).toThrow();
  });
});
