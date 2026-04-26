import { describe, it, expect } from 'vitest';
import { evaluateCompliance } from './ruleEngine';
import { makeDoc } from '../test/factories';

/**
 * Coverage-focused suite that targets the *remaining* branches of
 * `evaluateLegacyRule` that the higher-level behavioural tests in
 * ruleEngine.test.js don't reach. One template-bucket per describe
 * block; each `it` toggles a single field and asserts the matching
 * rule ID flips off.
 */

const has = (warnings, id) => warnings.some((w) => w.id === id);

describe('government employee booking — GOV-1 / GOV-2', () => {
  it('GOV-1 fires until tenant.occupation is filled', () => {
    expect(has(evaluateCompliance('bookingGov', makeDoc()), 'GOV-1')).toBe(true);
    expect(
      has(evaluateCompliance('bookingGov', makeDoc({ tenant: { occupation: 'Police' } })), 'GOV-1'),
    ).toBe(false);
  });

  it('GOV-2 fires until payments.signingDeadline is set', () => {
    expect(has(evaluateCompliance('bookingGov', makeDoc()), 'GOV-2')).toBe(true);
    expect(
      has(
        evaluateCompliance('bookingGov', makeDoc({ payments: { signingDeadline: '2026-05-15' } })),
        'GOV-2',
      ),
    ).toBe(false);
  });
});

describe('addendum — ADD-1', () => {
  it('ADD-1 fires when addendum.originalContractRef is absent', () => {
    // makeDoc() has no addendum section → ADD-1 should fire
    expect(has(evaluateCompliance('addendum', makeDoc()), 'ADD-1')).toBe(true);
  });

  it('ADD-1 clears when addendum.originalContractRef is set', () => {
    expect(
      has(
        evaluateCompliance('addendum', makeDoc({ addendum: { originalContractRef: 'WC-2026-TC-0042' } })),
        'ADD-1',
      ),
    ).toBe(false);
  });
});

describe('tenancy contract — TEN-1 / TEN-2', () => {
  it('TEN-1 needs BOTH landlord.name and tenant.fullName', () => {
    const onlyLandlord = evaluateCompliance('tenancy', makeDoc({ landlord: { name: 'WC' } }));
    const both = evaluateCompliance(
      'tenancy',
      makeDoc({
        landlord: { name: 'WC' },
        tenant: { fullName: 'Jane' },
      }),
    );
    expect(has(onlyLandlord, 'TEN-1')).toBe(true);
    expect(has(both, 'TEN-1')).toBe(false);
  });

  it('TEN-2 fires until ejariOccupantsRegistered is true', () => {
    expect(has(evaluateCompliance('tenancy', makeDoc()), 'TEN-2')).toBe(true);
    expect(
      has(evaluateCompliance('tenancy', makeDoc({ occupancy: { ejariOccupantsRegistered: true } })), 'TEN-2'),
    ).toBe(false);
  });
});

describe('invoice — INV-1', () => {
  it('INV-1 needs BOTH landlord.name and payments.total', () => {
    const partial = evaluateCompliance('invoice', makeDoc({ landlord: { name: 'WC' } }));
    const full = evaluateCompliance(
      'invoice',
      makeDoc({
        landlord: { name: 'WC' },
        payments: { total: '120000' },
      }),
    );
    expect(has(partial, 'INV-1')).toBe(true);
    expect(has(full, 'INV-1')).toBe(false);
  });
});

describe('key handover — KEY-1', () => {
  it('KEY-1 fires until occupancy.occupants is filled', () => {
    expect(has(evaluateCompliance('keyHandover', makeDoc()), 'KEY-1')).toBe(true);
    expect(
      has(evaluateCompliance('keyHandover', makeDoc({ occupancy: { occupants: 'Jane Doe' } })), 'KEY-1'),
    ).toBe(false);
  });
});

describe('offer letter — OFR-1..OFR-6 (all six branches)', () => {
  it('OFR-1 cleared by tenant.emiratesId', () => {
    expect(has(evaluateCompliance('offer', makeDoc()), 'OFR-1')).toBe(true);
    expect(has(evaluateCompliance('offer', makeDoc({ tenant: { emiratesId: '784-1' } })), 'OFR-1')).toBe(
      false,
    );
  });

  it('OFR-2 cleared by landlord.name', () => {
    expect(has(evaluateCompliance('offer', makeDoc()), 'OFR-2')).toBe(true);
    expect(has(evaluateCompliance('offer', makeDoc({ landlord: { name: 'WC' } })), 'OFR-2')).toBe(false);
  });

  it('OFR-3 cleared by property.referenceNo', () => {
    expect(has(evaluateCompliance('offer', makeDoc()), 'OFR-3')).toBe(true);
    expect(has(evaluateCompliance('offer', makeDoc({ property: { referenceNo: 'REF-1' } })), 'OFR-3')).toBe(
      false,
    );
  });

  it('OFR-4 cleared by payments.securityDeposit', () => {
    expect(has(evaluateCompliance('offer', makeDoc()), 'OFR-4')).toBe(true);
    expect(
      has(evaluateCompliance('offer', makeDoc({ payments: { securityDeposit: '5000' } })), 'OFR-4'),
    ).toBe(false);
  });

  it('OFR-5 cleared by payments.signingDeadline', () => {
    expect(has(evaluateCompliance('offer', makeDoc()), 'OFR-5')).toBe(true);
    expect(
      has(evaluateCompliance('offer', makeDoc({ payments: { signingDeadline: '2026-05-15' } })), 'OFR-5'),
    ).toBe(false);
  });

  it('OFR-6 cleared by property.documentDate', () => {
    expect(has(evaluateCompliance('offer', makeDoc()), 'OFR-6')).toBe(true);
    expect(
      has(evaluateCompliance('offer', makeDoc({ property: { documentDate: '2026-04-23' } })), 'OFR-6'),
    ).toBe(false);
  });
});
