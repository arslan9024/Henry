import { describe, it, expect } from 'vitest';
import {
  parseDateValue,
  differenceInDays,
  todayDate,
  formatDateDisplay,
  sanitizeNumber,
  getReraAllowedIncreasePercent,
  formatCurrency,
} from './dateUtils';

describe('parseDateValue', () => {
  it('returns null for null/empty', () => {
    expect(parseDateValue(null)).toBeNull();
    expect(parseDateValue('')).toBeNull();
    expect(parseDateValue(undefined)).toBeNull();
  });

  it('returns Date instances unchanged', () => {
    const d = new Date('2026-04-23');
    expect(parseDateValue(d)).toBe(d);
  });

  it('parses ISO strings', () => {
    const d = parseDateValue('2026-04-23');
    expect(d).toBeInstanceOf(Date);
    expect(d.getUTCFullYear()).toBe(2026);
  });

  it('parses long-form "23 April 2026"', () => {
    const d = parseDateValue('23 April 2026');
    expect(d).toBeInstanceOf(Date);
    expect(d.getFullYear()).toBe(2026);
  });

  it('returns null for unparseable garbage', () => {
    expect(parseDateValue('not a date at all')).toBeNull();
  });
});

describe('differenceInDays', () => {
  it('counts whole days between two dates', () => {
    expect(differenceInDays('2026-04-01', '2026-04-23')).toBe(22);
  });

  it('returns negative when the order is reversed', () => {
    expect(differenceInDays('2026-04-23', '2026-04-01')).toBe(-22);
  });

  it('returns null if either side is unparseable', () => {
    expect(differenceInDays('garbage', '2026-04-23')).toBeNull();
    expect(differenceInDays('2026-04-23', null)).toBeNull();
  });
});

describe('todayDate', () => {
  it('returns a Date at local midnight (no time component)', () => {
    const d = todayDate();
    expect(d.getHours()).toBe(0);
    expect(d.getMinutes()).toBe(0);
    expect(d.getSeconds()).toBe(0);
    expect(d.getMilliseconds()).toBe(0);
  });
});

describe('formatDateDisplay', () => {
  it('formats parseable values as DD MMM YYYY (en-GB)', () => {
    expect(formatDateDisplay('2026-04-23')).toMatch(/23 Apr 2026/);
  });

  it("returns 'Not set' for unparseable input", () => {
    expect(formatDateDisplay('')).toBe('Not set');
    expect(formatDateDisplay('???')).toBe('Not set');
  });
});

describe('sanitizeNumber', () => {
  it('returns 0 for null/empty/undefined', () => {
    expect(sanitizeNumber(null)).toBe(0);
    expect(sanitizeNumber('')).toBe(0);
    expect(sanitizeNumber(undefined)).toBe(0);
  });

  it('strips currency symbols and commas', () => {
    expect(sanitizeNumber('AED 85,000')).toBe(85000);
    expect(sanitizeNumber('1,234.56')).toBe(1234.56);
  });

  it('handles negatives', () => {
    expect(sanitizeNumber('-500')).toBe(-500);
  });

  it('returns 0 for non-numeric strings', () => {
    expect(sanitizeNumber('abc')).toBe(0);
  });
});

describe('getReraAllowedIncreasePercent (RERA Decree 43/2013 brackets)', () => {
  it('returns 0 when current >= market', () => {
    expect(getReraAllowedIncreasePercent({ currentRent: 100000, marketRent: 90000 })).toBe(0);
    expect(getReraAllowedIncreasePercent({ currentRent: 90000, marketRent: 90000 })).toBe(0);
  });

  it('returns 0 when gap is ≤ 10%', () => {
    // current=95k, market=100k → gap 5% → 0%
    expect(getReraAllowedIncreasePercent({ currentRent: 95000, marketRent: 100000 })).toBe(0);
  });

  it('returns 5 when gap is 11–20%', () => {
    // current=85k, market=100k → gap 15% → 5%
    expect(getReraAllowedIncreasePercent({ currentRent: 85000, marketRent: 100000 })).toBe(5);
  });

  it('returns 10 when gap is 21–30%', () => {
    // current=75k, market=100k → gap 25% → 10%
    expect(getReraAllowedIncreasePercent({ currentRent: 75000, marketRent: 100000 })).toBe(10);
  });

  it('returns 15 when gap is 31–40%', () => {
    // current=65k, market=100k → gap 35% → 15%
    expect(getReraAllowedIncreasePercent({ currentRent: 65000, marketRent: 100000 })).toBe(15);
  });

  it('returns 20 when gap is > 40%', () => {
    // current=50k, market=100k → gap 50% → 20%
    expect(getReraAllowedIncreasePercent({ currentRent: 50000, marketRent: 100000 })).toBe(20);
  });

  it('handles missing/zero inputs by returning 0', () => {
    expect(getReraAllowedIncreasePercent({ currentRent: 0, marketRent: 100000 })).toBe(0);
    expect(getReraAllowedIncreasePercent({ currentRent: 100000, marketRent: 0 })).toBe(0);
  });
});

describe('formatCurrency', () => {
  it('prefixes AED and adds thousands separators', () => {
    expect(formatCurrency(85000)).toBe('AED 85,000');
  });

  it('sanitises strings with symbols first', () => {
    expect(formatCurrency('AED 1,234.56')).toMatch(/^AED 1,234/);
  });

  it('returns AED 0 for null/garbage', () => {
    expect(formatCurrency(null)).toBe('AED 0');
    expect(formatCurrency('xyz')).toBe('AED 0');
  });
});
