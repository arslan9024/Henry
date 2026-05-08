/**
 * ruleCatalog — data integrity tests
 *
 * buyingRules and leasingRules export plain catalog objects consumed by
 * the ruleEngine.  These tests pin the shape and content so any accidental
 * mutation (field rename, ID collision, missing required property) is
 * caught immediately.
 *
 * Covers:
 *   buyingRules  — offer bucket (6 rules)
 *   leasingRules — viewing, booking, bookingGov, addendum, tenancy,
 *                  invoice, keyHandover buckets
 */
import { describe, it, expect } from 'vitest';
import { buyingRules } from './buyingRules';
import { leasingRules } from './leasingRules';

// ── shared assertions ─────────────────────────────────────────────────────────

const VALID_SEVERITIES = new Set(['critical', 'important', 'info']);

const assertRuleShape = (rule, context) => {
  expect(rule.id, `${context}: missing id`).toBeTypeOf('string');
  expect(rule.id.length, `${context}: id is empty`).toBeGreaterThan(0);
  expect(rule.severity, `${context}: invalid severity on ${rule.id}`).toSatisfy((s) =>
    VALID_SEVERITIES.has(s),
  );
  expect(rule.message, `${context}: missing message on ${rule.id}`).toBeTypeOf('string');
  expect(rule.message.length, `${context}: empty message on ${rule.id}`).toBeGreaterThan(0);
};

const assertBucket = (bucket, templateKey) => {
  expect(Array.isArray(bucket), `${templateKey}: not an array`).toBe(true);
  expect(bucket.length, `${templateKey}: empty bucket`).toBeGreaterThan(0);
  const ids = bucket.map((r) => r.id);
  const unique = new Set(ids);
  expect(unique.size, `${templateKey}: duplicate rule IDs`).toBe(ids.length);
  bucket.forEach((rule) => assertRuleShape(rule, templateKey));
};

// ── buyingRules ───────────────────────────────────────────────────────────────

describe('buyingRules — offer bucket', () => {
  it('exports an object with an "offer" array', () => {
    expect(buyingRules).toHaveProperty('offer');
    expect(Array.isArray(buyingRules.offer)).toBe(true);
  });

  it('offer bucket has 6 rules with correct shape', () => {
    assertBucket(buyingRules.offer, 'offer');
    expect(buyingRules.offer).toHaveLength(6);
  });

  it('rule IDs follow OFR-N naming pattern', () => {
    buyingRules.offer.forEach((rule) => {
      expect(rule.id).toMatch(/^OFR-\d+$/);
    });
  });

  it('OFR-1 is critical (buyer Emirates ID)', () => {
    const rule = buyingRules.offer.find((r) => r.id === 'OFR-1');
    expect(rule).toBeDefined();
    expect(rule.severity).toBe('critical');
    expect(rule.message).toMatch(/Emirates ID|passport/i);
  });

  it('has at least one critical and at least one info severity rule', () => {
    const severities = new Set(buyingRules.offer.map((r) => r.severity));
    expect(severities.has('critical')).toBe(true);
    expect(severities.has('info')).toBe(true);
  });
});

// ── leasingRules ──────────────────────────────────────────────────────────────

describe('leasingRules — bucket existence and shape', () => {
  const EXPECTED_BUCKETS = [
    'viewing',
    'booking',
    'bookingGov',
    'addendum',
    'tenancy',
    'invoice',
    'keyHandover',
  ];

  it('exports all expected template buckets', () => {
    EXPECTED_BUCKETS.forEach((key) => {
      expect(leasingRules, `missing bucket: ${key}`).toHaveProperty(key);
    });
  });

  EXPECTED_BUCKETS.forEach((key) => {
    it(`"${key}" bucket has valid shape (IDs unique, severity valid, message non-empty)`, () => {
      assertBucket(leasingRules[key], key);
    });
  });
});

describe('leasingRules — spot checks on critical rules', () => {
  it('VIEW-1 through VIEW-4 are all present in viewing bucket', () => {
    const ids = leasingRules.viewing.map((r) => r.id);
    ['VIEW-1', 'VIEW-2', 'VIEW-3', 'VIEW-4'].forEach((id) => {
      expect(ids, `missing ${id}`).toContain(id);
    });
  });

  it('VIEW-1 and VIEW-2 are critical severity', () => {
    const byId = Object.fromEntries(leasingRules.viewing.map((r) => [r.id, r]));
    expect(byId['VIEW-1'].severity).toBe('critical');
    expect(byId['VIEW-2'].severity).toBe('critical');
  });

  it('BOOK-1 and BOOK-2 in booking are critical', () => {
    const byId = Object.fromEntries(leasingRules.booking.map((r) => [r.id, r]));
    expect(byId['BOOK-1'].severity).toBe('critical');
    expect(byId['BOOK-2'].severity).toBe('critical');
  });

  it('ADD-2 in addendum is critical (tenant name required)', () => {
    const rule = leasingRules.addendum.find((r) => r.id === 'ADD-2');
    expect(rule).toBeDefined();
    expect(rule.severity).toBe('critical');
  });

  it('TEN-1 in tenancy is critical (identity check)', () => {
    const rule = leasingRules.tenancy.find((r) => r.id === 'TEN-1');
    expect(rule).toBeDefined();
    expect(rule.severity).toBe('critical');
  });

  it('INV-1 in invoice is critical (beneficiary + purpose)', () => {
    const rule = leasingRules.invoice.find((r) => r.id === 'INV-1');
    expect(rule).toBeDefined();
    expect(rule.severity).toBe('critical');
  });

  it('KEY-1 in keyHandover is important (key count and condition)', () => {
    const rule = leasingRules.keyHandover.find((r) => r.id === 'KEY-1');
    expect(rule).toBeDefined();
    expect(rule.severity).toBe('important');
  });
});
