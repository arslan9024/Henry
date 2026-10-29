import { describe, it, expect } from 'vitest';
import { parseFlexibleDate, formatUaeDate, advanceRenewalDates } from './renewalDateCalculator';

describe('renewalDateCalculator', () => {
  it('parses UAE standard DD-MM-YYYY format', () => {
    const dt = parseFlexibleDate('01-10-2026');
    expect(dt).not.toBeNull();
    expect(dt?.getFullYear()).toBe(2026);
    expect(dt?.getMonth()).toBe(9); // October is 9 in 0-indexed
    expect(dt?.getDate()).toBe(1);
  });

  it('formats date into DD-MM-YYYY string', () => {
    const dt = new Date(2027, 9, 1);
    expect(formatUaeDate(dt)).toBe('01-10-2027');
  });

  it('advances dates forward by 1 calendar year', () => {
    const res = advanceRenewalDates('01-10-2026', '30-09-2027');
    expect(res.startDate).toBe('01-10-2027');
    expect(res.endDate).toBe('30-09-2028');
  });
});
