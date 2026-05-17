/**
 * leasingRules.test.js
 * Verifies the structure and content of the DLD leasing compliance rules catalog.
 * Pure-data tests — no rendering, no store needed.
 */
import { describe, it, expect } from 'vitest';
import { leasingRules } from './leasingRules';

const VALID_SEVERITIES = ['critical', 'important', 'info'];

// ── top-level shape ───────────────────────────────────────────────────────────

describe('leasingRules — catalog shape', () => {
  it('exports a leasingRules object', () => {
    expect(leasingRules).toBeDefined();
    expect(typeof leasingRules).toBe('object');
  });

  it('contains all expected template-type keys', () => {
    const expectedKeys = [
      'viewing',
      'booking',
      'bookingGov',
      'addendum',
      'tenancy',
      'invoice',
      'keyHandover',
    ];
    expectedKeys.forEach((key) => {
      expect(leasingRules).toHaveProperty(key);
      expect(Array.isArray(leasingRules[key])).toBe(true);
    });
  });

  it('every section has at least one rule', () => {
    Object.values(leasingRules).forEach((rules) => {
      expect(rules.length).toBeGreaterThan(0);
    });
  });
});

// ── helper: assert all rules in a section are well-formed ────────────────────

function assertWellFormed(rules, idPrefix) {
  rules.forEach((rule) => {
    expect(typeof rule.id).toBe('string');
    expect(rule.id).toMatch(new RegExp(`^${idPrefix}-`));
    expect(VALID_SEVERITIES).toContain(rule.severity);
    expect(typeof rule.message).toBe('string');
    expect(rule.message.length).toBeGreaterThan(0);
  });
  // unique ids within section
  const ids = rules.map((r) => r.id);
  expect(new Set(ids).size).toBe(ids.length);
}

describe('leasingRules — viewing section', () => {
  it('all rules are well-formed (VIEW- prefix)', () => {
    assertWellFormed(leasingRules.viewing, 'VIEW');
  });

  it('VIEW-1 is critical and mentions RERA', () => {
    const r = leasingRules.viewing.find((r) => r.id === 'VIEW-1');
    expect(r.severity).toBe('critical');
    expect(r.message).toMatch(/rera/i);
  });

  it('VIEW-2 is critical (date required)', () => {
    const r = leasingRules.viewing.find((r) => r.id === 'VIEW-2');
    expect(r.severity).toBe('critical');
    expect(r.message).toMatch(/date/i);
  });

  it('VIEW-3 requires Broker ORN and BRN', () => {
    const r = leasingRules.viewing.find((r) => r.id === 'VIEW-3');
    expect(r.severity).toBe('critical');
    expect(r.message).toMatch(/ORN|BRN/i);
  });

  it('VIEW-4 requires tenant identity', () => {
    const r = leasingRules.viewing.find((r) => r.id === 'VIEW-4');
    expect(r.severity).toBe('critical');
    expect(r.message).toMatch(/tenant/i);
  });

  it('has 6 viewing rules', () => {
    expect(leasingRules.viewing).toHaveLength(6);
  });
});

describe('leasingRules — booking section', () => {
  it('all rules are well-formed (BOOK- prefix)', () => {
    assertWellFormed(leasingRules.booking, 'BOOK');
  });

  it('BOOK-1 is critical (tenant name)', () => {
    const r = leasingRules.booking.find((r) => r.id === 'BOOK-1');
    expect(r.severity).toBe('critical');
    expect(r.message).toMatch(/tenant/i);
  });

  it('BOOK-2 is critical (Emirates ID)', () => {
    const r = leasingRules.booking.find((r) => r.id === 'BOOK-2');
    expect(r.severity).toBe('critical');
    expect(r.message).toMatch(/emirates id/i);
  });

  it('has 3 booking rules', () => {
    expect(leasingRules.booking).toHaveLength(3);
  });
});

describe('leasingRules — bookingGov section', () => {
  it('all rules are well-formed (GOV- prefix)', () => {
    assertWellFormed(leasingRules.bookingGov, 'GOV');
  });

  it('GOV-1 is critical (government/military payer)', () => {
    const r = leasingRules.bookingGov.find((r) => r.id === 'GOV-1');
    expect(r.severity).toBe('critical');
    expect(r.message).toMatch(/government|military/i);
  });

  it('has 2 bookingGov rules', () => {
    expect(leasingRules.bookingGov).toHaveLength(2);
  });
});

describe('leasingRules — addendum section', () => {
  it('all rules are well-formed (ADD- prefix)', () => {
    assertWellFormed(leasingRules.addendum, 'ADD');
  });

  it('ADD-2 is critical (tenant name)', () => {
    const r = leasingRules.addendum.find((r) => r.id === 'ADD-2');
    expect(r.severity).toBe('critical');
    expect(r.message).toMatch(/tenant/i);
  });

  it('has 3 addendum rules', () => {
    expect(leasingRules.addendum).toHaveLength(3);
  });
});

describe('leasingRules — tenancy section', () => {
  it('all rules are well-formed (TEN- prefix)', () => {
    assertWellFormed(leasingRules.tenancy, 'TEN');
  });

  it('TEN-1 is critical (identities)', () => {
    const r = leasingRules.tenancy.find((r) => r.id === 'TEN-1');
    expect(r.severity).toBe('critical');
    expect(r.message).toMatch(/landlord|tenant/i);
  });

  it('has 2 tenancy rules', () => {
    expect(leasingRules.tenancy).toHaveLength(2);
  });
});

describe('leasingRules — invoice section', () => {
  it('all rules are well-formed (INV- prefix)', () => {
    assertWellFormed(leasingRules.invoice, 'INV');
  });

  it('INV-1 is critical (beneficiary + payment purpose)', () => {
    const r = leasingRules.invoice.find((r) => r.id === 'INV-1');
    expect(r.severity).toBe('critical');
  });

  it('has 1 invoice rule', () => {
    expect(leasingRules.invoice).toHaveLength(1);
  });
});

describe('leasingRules — keyHandover section', () => {
  it('all rules are well-formed (KEY- prefix)', () => {
    assertWellFormed(leasingRules.keyHandover, 'KEY');
  });

  it('KEY-1 mentions key count / checklist', () => {
    const r = leasingRules.keyHandover.find((r) => r.id === 'KEY-1');
    expect(r.message).toMatch(/key|checklist/i);
  });

  it('has 1 keyHandover rule', () => {
    expect(leasingRules.keyHandover).toHaveLength(1);
  });
});
