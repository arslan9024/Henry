/**
 * buyingRules.test.js
 * Verifies the structure and content of the DLD buying compliance rules catalog.
 * These are pure-data tests — no rendering, no store needed.
 */
import { describe, it, expect } from 'vitest';
import { buyingRules } from './buyingRules';

const VALID_SEVERITIES = ['critical', 'important', 'info'];

describe('buyingRules — catalog shape', () => {
  it('exports a buyingRules object', () => {
    expect(buyingRules).toBeDefined();
    expect(typeof buyingRules).toBe('object');
  });

  it('has an "offer" key', () => {
    expect(Array.isArray(buyingRules.offer)).toBe(true);
  });

  it('offer array has at least one rule', () => {
    expect(buyingRules.offer.length).toBeGreaterThan(0);
  });

  it('every rule has a non-empty id string', () => {
    buyingRules.offer.forEach((rule) => {
      expect(typeof rule.id).toBe('string');
      expect(rule.id.length).toBeGreaterThan(0);
    });
  });

  it('every rule id starts with "OFR-"', () => {
    buyingRules.offer.forEach((rule) => {
      expect(rule.id).toMatch(/^OFR-/);
    });
  });

  it('every rule has a valid severity', () => {
    buyingRules.offer.forEach((rule) => {
      expect(VALID_SEVERITIES).toContain(rule.severity);
    });
  });

  it('every rule has a non-empty message string', () => {
    buyingRules.offer.forEach((rule) => {
      expect(typeof rule.message).toBe('string');
      expect(rule.message.length).toBeGreaterThan(0);
    });
  });

  it('all rule ids are unique', () => {
    const ids = buyingRules.offer.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ── individual rule assertions ────────────────────────────────────────────────

describe('buyingRules — specific rules', () => {
  const rulesById = Object.fromEntries(buyingRules.offer.map((r) => [r.id, r]));

  it('OFR-1 is critical (Emirates ID requirement)', () => {
    expect(rulesById['OFR-1'].severity).toBe('critical');
    expect(rulesById['OFR-1'].message).toMatch(/emirates id/i);
  });

  it('OFR-2 is important (seller registration)', () => {
    expect(rulesById['OFR-2'].severity).toBe('important');
    expect(rulesById['OFR-2'].message).toMatch(/seller/i);
  });

  it('OFR-3 mentions RERA permit', () => {
    expect(rulesById['OFR-3'].message).toMatch(/rera/i);
  });

  it('OFR-4 mentions earnest money deposit', () => {
    expect(rulesById['OFR-4'].message).toMatch(/earnest money/i);
  });

  it('OFR-5 mentions financing contingency', () => {
    expect(rulesById['OFR-5'].message).toMatch(/financing/i);
  });

  it('OFR-6 is info severity (offer validity)', () => {
    expect(rulesById['OFR-6'].severity).toBe('info');
    expect(rulesById['OFR-6'].message).toMatch(/validity/i);
  });

  it('contains exactly 6 rules', () => {
    expect(buyingRules.offer).toHaveLength(6);
  });
});
