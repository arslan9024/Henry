import { describe, it, expect } from 'vitest';
import { evaluateCompliance } from './ruleEngine';
import { makeDoc } from '../test/factories';

/**
 * These tests pin down the *legacy* rule engine — the catalog-driven rules
 * defined in ruleCatalog/{leasing,buying}Rules.js plus the matching
 * `evaluateLegacyRule` switch. The knowledge-base rules are evaluated
 * separately and have their own data dependencies, so we don't gate them
 * here — we only assert that they don't crash on a minimal doc.
 */

describe('evaluateCompliance — viewing template (RERA P210)', () => {
  it('flags every critical VIEW rule when the document is empty', () => {
    const warnings = evaluateCompliance('viewing', makeDoc());
    const ids = warnings.map((w) => w.id);
    // VIEW-1..4 are critical; VIEW-5..6 are important — all should fire on empty doc.
    expect(ids).toEqual(expect.arrayContaining(['VIEW-1', 'VIEW-2', 'VIEW-3', 'VIEW-4', 'VIEW-5', 'VIEW-6']));
  });

  it('clears VIEW-1 when unit AND community are present', () => {
    const before = evaluateCompliance('viewing', makeDoc());
    const after = evaluateCompliance(
      'viewing',
      makeDoc({
        property: { unit: 'A-101', community: 'Downtown' },
      }),
    );
    expect(before.some((w) => w.id === 'VIEW-1')).toBe(true);
    expect(after.some((w) => w.id === 'VIEW-1')).toBe(false);
  });

  it('keeps VIEW-3 firing until ALL three broker fields are present', () => {
    const partial = evaluateCompliance(
      'viewing',
      makeDoc({
        broker: { orn: '12345', brn: '67890' /* commercialLicenseNumber missing */ },
      }),
    );
    const full = evaluateCompliance(
      'viewing',
      makeDoc({
        broker: { orn: '12345', brn: '67890', commercialLicenseNumber: 'CL-555' },
      }),
    );
    expect(partial.some((w) => w.id === 'VIEW-3')).toBe(true);
    expect(full.some((w) => w.id === 'VIEW-3')).toBe(false);
  });

  it('VIEW-4 accepts EITHER Emirates ID OR passport (RERA flexibility)', () => {
    const eid = evaluateCompliance(
      'viewing',
      makeDoc({
        tenant: { fullName: 'Jane Doe', emiratesId: '784-...' },
      }),
    );
    const passport = evaluateCompliance(
      'viewing',
      makeDoc({
        tenant: { fullName: 'Jane Doe', passportNo: 'X1234' },
      }),
    );
    expect(eid.some((w) => w.id === 'VIEW-4')).toBe(false);
    expect(passport.some((w) => w.id === 'VIEW-4')).toBe(false);
  });
});

describe('evaluateCompliance — booking template', () => {
  it('flags BOOK-1 and BOOK-2 (critical) on empty doc', () => {
    const ids = evaluateCompliance('booking', makeDoc()).map((w) => w.id);
    expect(ids).toContain('BOOK-1');
    expect(ids).toContain('BOOK-2');
  });

  it('BOOK-3 clears once all three date fields are filled', () => {
    const partial = evaluateCompliance(
      'booking',
      makeDoc({
        payments: { moveInDate: '2026-05-01', contractStartDate: '2026-05-01' /* end missing */ },
      }),
    );
    const full = evaluateCompliance(
      'booking',
      makeDoc({
        payments: {
          moveInDate: '2026-05-01',
          contractStartDate: '2026-05-01',
          contractEndDate: '2027-04-30',
        },
      }),
    );
    expect(partial.some((w) => w.id === 'BOOK-3')).toBe(true);
    expect(full.some((w) => w.id === 'BOOK-3')).toBe(false);
  });
});

describe('evaluateCompliance — unknown template', () => {
  it('returns an array (possibly empty after KB rules) instead of throwing', () => {
    const result = evaluateCompliance('not-a-real-template', makeDoc());
    expect(Array.isArray(result)).toBe(true);
  });
});

describe('evaluateCompliance — warning shape', () => {
  it('every warning has id + severity + message', () => {
    const warnings = evaluateCompliance('viewing', makeDoc());
    expect(warnings.length).toBeGreaterThan(0);
    for (const w of warnings) {
      expect(w).toMatchObject({
        id: expect.any(String),
        severity: expect.stringMatching(/^(critical|important|info)$/),
        message: expect.any(String),
      });
    }
  });
});
