/**
 * registry.test.js
 * Tests for TEMPLATE_CONFIG, TEMPLATE_MAP, and getTemplateSourcePolicy.
 * Treats component values as opaque references — we verify they are
 * functions, not that they render correctly (rendering lives elsewhere).
 */
import { describe, it, expect } from 'vitest';
import { TEMPLATE_CONFIG, TEMPLATE_MAP, getTemplateSourcePolicy } from './registry';

// ── TEMPLATE_CONFIG shape ─────────────────────────────────────────────────────

describe('TEMPLATE_CONFIG', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(TEMPLATE_CONFIG)).toBe(true);
    expect(TEMPLATE_CONFIG.length).toBeGreaterThan(0);
  });

  it('has exactly 9 entries', () => {
    expect(TEMPLATE_CONFIG).toHaveLength(9);
  });

  it('every entry has a unique key', () => {
    const keys = TEMPLATE_CONFIG.map((t) => t.key);
    const unique = new Set(keys);
    expect(unique.size).toBe(TEMPLATE_CONFIG.length);
  });

  it('every entry has a non-empty label string', () => {
    TEMPLATE_CONFIG.forEach((t) => {
      expect(typeof t.label).toBe('string');
      expect(t.label.length).toBeGreaterThan(0);
    });
  });

  it('every entry exposes a component (function or React.memo object)', () => {
    TEMPLATE_CONFIG.forEach((t) => {
      // Plain functional components → 'function'; React.memo wrappers → 'object'
      expect(t.component).toBeDefined();
      expect(['function', 'object']).toContain(typeof t.component);
    });
  });

  it('every entry has a boolean supportsPdf field', () => {
    TEMPLATE_CONFIG.forEach((t) => {
      expect(typeof t.supportsPdf).toBe('boolean');
    });
  });

  it('every entry has a sourceOfTruth object', () => {
    TEMPLATE_CONFIG.forEach((t) => {
      expect(t.sourceOfTruth).toBeDefined();
      expect(typeof t.sourceOfTruth).toBe('object');
    });
  });

  it('sourceOfTruth.immutable is a boolean on every entry', () => {
    TEMPLATE_CONFIG.forEach((t) => {
      expect(typeof t.sourceOfTruth.immutable).toBe('boolean');
    });
  });

  it('sourceOfTruth.governmentIssued is a boolean on every entry', () => {
    TEMPLATE_CONFIG.forEach((t) => {
      expect(typeof t.sourceOfTruth.governmentIssued).toBe('boolean');
    });
  });

  it('sourceOfTruth.templateVersion is a non-empty string on every entry', () => {
    TEMPLATE_CONFIG.forEach((t) => {
      expect(typeof t.sourceOfTruth.templateVersion).toBe('string');
      expect(t.sourceOfTruth.templateVersion.length).toBeGreaterThan(0);
    });
  });

  it('contains the "viewing" entry', () => {
    expect(TEMPLATE_CONFIG.find((t) => t.key === 'viewing')).toBeDefined();
  });

  it('contains the "tenancy" entry', () => {
    expect(TEMPLATE_CONFIG.find((t) => t.key === 'tenancy')).toBeDefined();
  });

  it('contains the "booking" entry', () => {
    expect(TEMPLATE_CONFIG.find((t) => t.key === 'booking')).toBeDefined();
  });

  it('contains the "salaryCertificate" entry', () => {
    expect(TEMPLATE_CONFIG.find((t) => t.key === 'salaryCertificate')).toBeDefined();
  });

  it('"invoice" entry has supportsPdf = false', () => {
    const invoice = TEMPLATE_CONFIG.find((t) => t.key === 'invoice');
    expect(invoice.supportsPdf).toBe(false);
  });

  it('"viewing" entry has supportsPdf = true', () => {
    const viewing = TEMPLATE_CONFIG.find((t) => t.key === 'viewing');
    expect(viewing.supportsPdf).toBe(true);
  });

  it('"bookingGov" is government-issued', () => {
    const bookingGov = TEMPLATE_CONFIG.find((t) => t.key === 'bookingGov');
    expect(bookingGov.sourceOfTruth.governmentIssued).toBe(true);
  });

  it('"booking" is not government-issued', () => {
    const booking = TEMPLATE_CONFIG.find((t) => t.key === 'booking');
    expect(booking.sourceOfTruth.governmentIssued).toBe(false);
  });

  it('all templateVersion values equal "2026.04"', () => {
    TEMPLATE_CONFIG.forEach((t) => {
      expect(t.sourceOfTruth.templateVersion).toBe('2026.04');
    });
  });
});

// ── TEMPLATE_MAP ──────────────────────────────────────────────────────────────

describe('TEMPLATE_MAP', () => {
  it('is a plain object', () => {
    expect(typeof TEMPLATE_MAP).toBe('object');
    expect(TEMPLATE_MAP).not.toBeNull();
  });

  it('has same key count as TEMPLATE_CONFIG', () => {
    expect(Object.keys(TEMPLATE_MAP).length).toBe(TEMPLATE_CONFIG.length);
  });

  it('every TEMPLATE_CONFIG key is present in TEMPLATE_MAP', () => {
    TEMPLATE_CONFIG.forEach((t) => {
      expect(TEMPLATE_MAP[t.key]).toBeDefined();
    });
  });

  it('TEMPLATE_MAP["viewing"] references the same object as TEMPLATE_CONFIG', () => {
    const fromConfig = TEMPLATE_CONFIG.find((t) => t.key === 'viewing');
    expect(TEMPLATE_MAP['viewing']).toBe(fromConfig);
  });

  it('TEMPLATE_MAP["keyHandover"] exists and has the correct label', () => {
    expect(TEMPLATE_MAP['keyHandover'].label).toBe('Key Handover and Maintenance Confirmation');
  });

  it('returns undefined for unknown keys', () => {
    expect(TEMPLATE_MAP['nonExistentKey']).toBeUndefined();
  });
});

// ── getTemplateSourcePolicy ───────────────────────────────────────────────────

describe('getTemplateSourcePolicy', () => {
  it('returns immutable=true for "viewing"', () => {
    const policy = getTemplateSourcePolicy('viewing');
    expect(policy.immutable).toBe(true);
  });

  it('returns governmentIssued=true for "viewing"', () => {
    const policy = getTemplateSourcePolicy('viewing');
    expect(policy.governmentIssued).toBe(true);
  });

  it('returns governmentIssued=false for "invoice"', () => {
    const policy = getTemplateSourcePolicy('invoice');
    expect(policy.governmentIssued).toBe(false);
  });

  it('returns correct templateVersion for "tenancy"', () => {
    const policy = getTemplateSourcePolicy('tenancy');
    expect(policy.templateVersion).toBe('2026.04');
  });

  it('returns default policy for unknown key', () => {
    const policy = getTemplateSourcePolicy('doesNotExist');
    expect(policy.immutable).toBe(true);
    expect(policy.governmentIssued).toBe(false);
    expect(policy.templateVersion).toBe('unknown');
  });

  it('returns an object with exactly immutable, governmentIssued, templateVersion', () => {
    const policy = getTemplateSourcePolicy('booking');
    expect(Object.keys(policy).sort()).toEqual(['governmentIssued', 'immutable', 'templateVersion']);
  });

  it('returns governmentIssued as a boolean (not just truthy)', () => {
    const policy = getTemplateSourcePolicy('addendum');
    expect(typeof policy.governmentIssued).toBe('boolean');
  });

  it('returns governmentIssued=true for "addendum"', () => {
    const policy = getTemplateSourcePolicy('addendum');
    expect(policy.governmentIssued).toBe(true);
  });

  it('returns governmentIssued=false for "offer"', () => {
    const policy = getTemplateSourcePolicy('offer');
    expect(policy.governmentIssued).toBe(false);
  });
});
