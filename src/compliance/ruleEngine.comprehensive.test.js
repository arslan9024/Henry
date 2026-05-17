/**
 * ruleEngine.comprehensive.test.js
 *
 * Exhaustive coverage of evaluateCompliance:
 *   - Every legacy rule fires on an empty document
 *   - Every legacy rule is cleared by its exact field(s)
 *   - Full valid document for each template yields 0 legacy warnings
 *   - Edge cases: null/undefined section fields, unknown templates
 *   - Warning shape contract (id, severity, message)
 *   - VIEW-5 and VIEW-6 (untested in existing suites)
 *   - ADD-3 (effectiveDate) branch
 *   - salaryCertificate template has no legacy rules
 */
import { describe, it, expect } from 'vitest';
import { evaluateCompliance } from './ruleEngine';
import { makeDoc } from '../test/factories';

// Helper: filter only legacy rule IDs (exclude KB- knowledge-base warnings)
const legacyIds = (template, doc) =>
  evaluateCompliance(template, doc)
    .map((w) => w.id)
    .filter((id) => !id.startsWith('KB-'));

const hasLegacy = (template, doc, id) => legacyIds(template, doc).includes(id);

// ── VIEWING template (VIEW-1 … VIEW-6) ───────────────────────────────────────

describe('viewing — VIEW-1 (unit + community)', () => {
  it('fires when both unit and community are empty', () => {
    expect(hasLegacy('viewing', makeDoc(), 'VIEW-1')).toBe(true);
  });

  it('fires when unit is present but community is missing', () => {
    expect(hasLegacy('viewing', makeDoc({ property: { unit: 'A-101' } }), 'VIEW-1')).toBe(true);
  });

  it('fires when community is present but unit is missing', () => {
    expect(hasLegacy('viewing', makeDoc({ property: { community: 'Downtown' } }), 'VIEW-1')).toBe(true);
  });

  it('clears when BOTH unit and community are filled', () => {
    expect(
      hasLegacy('viewing', makeDoc({ property: { unit: 'A-101', community: 'Downtown' } }), 'VIEW-1'),
    ).toBe(false);
  });
});

describe('viewing — VIEW-2 (documentDate)', () => {
  it('fires on empty documentDate', () => {
    expect(hasLegacy('viewing', makeDoc(), 'VIEW-2')).toBe(true);
  });

  it('clears when documentDate is set', () => {
    expect(hasLegacy('viewing', makeDoc({ property: { documentDate: '2026-04-23' } }), 'VIEW-2')).toBe(false);
  });
});

describe('viewing — VIEW-3 (broker: orn + brn + commercialLicenseNumber)', () => {
  it('fires when all broker fields are empty', () => {
    expect(hasLegacy('viewing', makeDoc(), 'VIEW-3')).toBe(true);
  });

  it('fires when only orn is present (brn + commercialLicense missing)', () => {
    expect(hasLegacy('viewing', makeDoc({ broker: { orn: '12345' } }), 'VIEW-3')).toBe(true);
  });

  it('fires when orn + brn present but commercialLicenseNumber missing', () => {
    expect(hasLegacy('viewing', makeDoc({ broker: { orn: '12345', brn: '67890' } }), 'VIEW-3')).toBe(true);
  });

  it('fires when orn + commercialLicenseNumber present but brn missing', () => {
    expect(
      hasLegacy('viewing', makeDoc({ broker: { orn: '12345', commercialLicenseNumber: 'CL-1' } }), 'VIEW-3'),
    ).toBe(true);
  });

  it('clears when all three broker fields are present', () => {
    expect(
      hasLegacy(
        'viewing',
        makeDoc({ broker: { orn: '12345', brn: '67890', commercialLicenseNumber: 'CL-555' } }),
        'VIEW-3',
      ),
    ).toBe(false);
  });
});

describe('viewing — VIEW-4 (tenant name + id/passport)', () => {
  it('fires when fullName and both id fields are empty', () => {
    expect(hasLegacy('viewing', makeDoc(), 'VIEW-4')).toBe(true);
  });

  it('fires when fullName is present but both id fields are empty', () => {
    expect(hasLegacy('viewing', makeDoc({ tenant: { fullName: 'Jane' } }), 'VIEW-4')).toBe(true);
  });

  it('fires when emiratesId present but fullName is empty', () => {
    expect(hasLegacy('viewing', makeDoc({ tenant: { emiratesId: '784-1' } }), 'VIEW-4')).toBe(true);
  });

  it('clears when fullName + emiratesId are both present', () => {
    expect(
      hasLegacy(
        'viewing',
        makeDoc({ tenant: { fullName: 'Jane Doe', emiratesId: '784-1990-1234567-1' } }),
        'VIEW-4',
      ),
    ).toBe(false);
  });

  it('clears when fullName + passportNo are both present (RERA flexibility)', () => {
    expect(
      hasLegacy('viewing', makeDoc({ tenant: { fullName: 'Jane Doe', passportNo: 'A12345678' } }), 'VIEW-4'),
    ).toBe(false);
  });
});

describe('viewing — VIEW-5 (makaniNo + plotNo)', () => {
  it('fires when both makaniNo and plotNo are empty', () => {
    expect(hasLegacy('viewing', makeDoc(), 'VIEW-5')).toBe(true);
  });

  it('fires when only makaniNo is present', () => {
    expect(hasLegacy('viewing', makeDoc({ property: { makaniNo: '12345' } }), 'VIEW-5')).toBe(true);
  });

  it('fires when only plotNo is present', () => {
    expect(hasLegacy('viewing', makeDoc({ property: { plotNo: 'P-999' } }), 'VIEW-5')).toBe(true);
  });

  it('clears when BOTH makaniNo and plotNo are filled', () => {
    expect(
      hasLegacy('viewing', makeDoc({ property: { makaniNo: '12345', plotNo: 'P-999' } }), 'VIEW-5'),
    ).toBe(false);
  });
});

describe('viewing — VIEW-6 (rentalBudget)', () => {
  it('fires when rentalBudget is empty', () => {
    expect(hasLegacy('viewing', makeDoc(), 'VIEW-6')).toBe(true);
  });

  it('clears when rentalBudget is set', () => {
    expect(hasLegacy('viewing', makeDoc({ viewing: { rentalBudget: '120,000' } }), 'VIEW-6')).toBe(false);
  });

  it('numeric value of 0 is falsy and still fires', () => {
    expect(hasLegacy('viewing', makeDoc({ viewing: { rentalBudget: 0 } }), 'VIEW-6')).toBe(true);
  });
});

describe('viewing — full valid document (0 legacy warnings)', () => {
  const fullViewingDoc = makeDoc({
    property: {
      unit: 'Unit 449',
      community: 'Damac Hills 2',
      documentDate: '2026-04-23',
      makaniNo: '5010042870',
      plotNo: '1234-5678',
    },
    broker: { orn: '29479', brn: '74192', commercialLicenseNumber: '1388443' },
    tenant: { fullName: 'Ahmed Al Mansouri', emiratesId: '784-1990-1234567-1' },
    viewing: { rentalBudget: '120,000' },
  });

  it('has exactly 0 legacy warnings', () => {
    expect(legacyIds('viewing', fullViewingDoc)).toHaveLength(0);
  });
});

// ── BOOKING template (BOOK-1 … BOOK-3) ───────────────────────────────────────

describe('booking — BOOK-1 (tenant.fullName)', () => {
  it('fires when fullName is empty', () => {
    expect(hasLegacy('booking', makeDoc(), 'BOOK-1')).toBe(true);
  });

  it('clears when fullName is set', () => {
    expect(hasLegacy('booking', makeDoc({ tenant: { fullName: 'Mohammed Al Rashid' } }), 'BOOK-1')).toBe(
      false,
    );
  });
});

describe('booking — BOOK-2 (tenant.emiratesId)', () => {
  it('fires when emiratesId is empty', () => {
    expect(hasLegacy('booking', makeDoc(), 'BOOK-2')).toBe(true);
  });

  it('clears when emiratesId is set', () => {
    expect(hasLegacy('booking', makeDoc({ tenant: { emiratesId: '784-1990-1234567-1' } }), 'BOOK-2')).toBe(
      false,
    );
  });
});

describe('booking — BOOK-3 (moveInDate + contractStartDate + contractEndDate)', () => {
  it('fires when all three dates are empty', () => {
    expect(hasLegacy('booking', makeDoc(), 'BOOK-3')).toBe(true);
  });

  it('fires when only moveInDate is filled', () => {
    expect(hasLegacy('booking', makeDoc({ payments: { moveInDate: '2026-05-01' } }), 'BOOK-3')).toBe(true);
  });

  it('fires when moveInDate + contractStartDate filled but endDate missing', () => {
    expect(
      hasLegacy(
        'booking',
        makeDoc({ payments: { moveInDate: '2026-05-01', contractStartDate: '2026-05-01' } }),
        'BOOK-3',
      ),
    ).toBe(true);
  });

  it('clears when all three dates are filled', () => {
    expect(
      hasLegacy(
        'booking',
        makeDoc({
          payments: {
            moveInDate: '2026-05-01',
            contractStartDate: '2026-05-01',
            contractEndDate: '2027-04-30',
          },
        }),
        'BOOK-3',
      ),
    ).toBe(false);
  });
});

describe('booking — full valid document (0 legacy warnings)', () => {
  const fullBookingDoc = makeDoc({
    tenant: {
      fullName: 'Ahmed Al Mansouri',
      emiratesId: '784-1990-1234567-1',
    },
    payments: {
      moveInDate: '2026-05-01',
      contractStartDate: '2026-05-01',
      contractEndDate: '2027-04-30',
    },
  });

  it('has 0 legacy warnings', () => {
    expect(legacyIds('booking', fullBookingDoc)).toHaveLength(0);
  });
});

// ── GOVERNMENT BOOKING (GOV-1 / GOV-2) ───────────────────────────────────────

describe('bookingGov — full valid document (0 legacy warnings)', () => {
  const fullGovDoc = makeDoc({
    tenant: { occupation: 'UAE Armed Forces' },
    payments: { signingDeadline: '2026-05-15' },
  });

  it('has 0 legacy warnings', () => {
    expect(legacyIds('bookingGov', fullGovDoc)).toHaveLength(0);
  });
});

// ── ADDENDUM (ADD-1 / ADD-2 / ADD-3) ─────────────────────────────────────────

describe('addendum — ADD-3 (effectiveDate)', () => {
  it('fires when effectiveDate is empty', () => {
    expect(hasLegacy('addendum', makeDoc(), 'ADD-3')).toBe(true);
  });

  it('clears when effectiveDate is set', () => {
    expect(hasLegacy('addendum', makeDoc({ addendum: { effectiveDate: '2026-05-01' } }), 'ADD-3')).toBe(
      false,
    );
  });
});

describe('addendum — ADD-2 (tenant.fullName)', () => {
  it('fires when tenant fullName is empty', () => {
    expect(hasLegacy('addendum', makeDoc(), 'ADD-2')).toBe(true);
  });

  it('clears when tenant.fullName is set', () => {
    expect(hasLegacy('addendum', makeDoc({ tenant: { fullName: 'Sara Khalid' } }), 'ADD-2')).toBe(false);
  });
});

describe('addendum — full valid document (0 legacy warnings)', () => {
  const fullAddendumDoc = makeDoc({
    tenant: { fullName: 'Ahmed Al Mansouri' },
    addendum: {
      originalContractRef: 'WC-2026-TC-0042',
      effectiveDate: '2026-05-01',
    },
  });

  it('has 0 legacy warnings', () => {
    expect(legacyIds('addendum', fullAddendumDoc)).toHaveLength(0);
  });
});

// ── TENANCY (TEN-1 / TEN-2) ───────────────────────────────────────────────────

describe('tenancy — full valid document (0 legacy warnings)', () => {
  const fullTenancyDoc = makeDoc({
    landlord: { name: 'White Caves Holdings' },
    tenant: { fullName: 'Mohammed Al Rashid' },
    occupancy: { ejariOccupantsRegistered: true },
  });

  it('has 0 legacy warnings', () => {
    expect(legacyIds('tenancy', fullTenancyDoc)).toHaveLength(0);
  });
});

describe('tenancy — TEN-2 truthy variants', () => {
  it('clears when ejariOccupantsRegistered is true', () => {
    expect(hasLegacy('tenancy', makeDoc({ occupancy: { ejariOccupantsRegistered: true } }), 'TEN-2')).toBe(
      false,
    );
  });

  it('fires when ejariOccupantsRegistered is false', () => {
    expect(hasLegacy('tenancy', makeDoc({ occupancy: { ejariOccupantsRegistered: false } }), 'TEN-2')).toBe(
      true,
    );
  });

  it('fires when ejariOccupantsRegistered is undefined', () => {
    expect(hasLegacy('tenancy', makeDoc(), 'TEN-2')).toBe(true);
  });
});

// ── INVOICE (INV-1) ───────────────────────────────────────────────────────────

describe('invoice — full valid document (0 legacy warnings)', () => {
  const fullInvoiceDoc = makeDoc({
    landlord: { name: 'White Caves Holdings' },
    payments: { total: '120,000' },
  });

  it('has 0 legacy warnings', () => {
    expect(legacyIds('invoice', fullInvoiceDoc)).toHaveLength(0);
  });
});

describe('invoice — INV-1 combinations', () => {
  it('fires when only landlord.name is filled (total missing)', () => {
    expect(hasLegacy('invoice', makeDoc({ landlord: { name: 'WC' } }), 'INV-1')).toBe(true);
  });

  it('fires when only payments.total is filled (landlord missing)', () => {
    expect(hasLegacy('invoice', makeDoc({ payments: { total: '120000' } }), 'INV-1')).toBe(true);
  });
});

// ── KEY HANDOVER (KEY-1) ──────────────────────────────────────────────────────

describe('keyHandover — full valid document (0 legacy warnings)', () => {
  const fullKeyDoc = makeDoc({
    occupancy: { occupants: 'Ahmed Al Mansouri' },
  });

  it('has 0 legacy warnings', () => {
    expect(legacyIds('keyHandover', fullKeyDoc)).toHaveLength(0);
  });
});

// ── OFFER LETTER (OFR-1 … OFR-6) ─────────────────────────────────────────────

describe('offer — all 6 OFR rules fire on empty doc', () => {
  it('all OFR rules present on empty document', () => {
    const ids = legacyIds('offer', makeDoc());
    ['OFR-1', 'OFR-2', 'OFR-3', 'OFR-4', 'OFR-5', 'OFR-6'].forEach((id) => {
      expect(ids).toContain(id);
    });
  });
});

describe('offer — full valid document (0 legacy warnings)', () => {
  const fullOfferDoc = makeDoc({
    tenant: { emiratesId: '784-1990-1234567-1' },
    landlord: { name: 'White Caves Holdings' },
    property: { referenceNo: 'REF-2026-001', documentDate: '2026-04-23' },
    payments: { securityDeposit: '5,000', signingDeadline: '2026-05-15' },
  });

  it('has 0 legacy warnings', () => {
    expect(legacyIds('offer', fullOfferDoc)).toHaveLength(0);
  });
});

// ── SALARY CERTIFICATE ────────────────────────────────────────────────────────

describe('salaryCertificate — no legacy rules', () => {
  it('returns an array for the salaryCertificate template', () => {
    const result = evaluateCompliance('salaryCertificate', makeDoc());
    expect(Array.isArray(result)).toBe(true);
  });

  it('has zero legacy (non-KB) warnings for any document', () => {
    expect(legacyIds('salaryCertificate', makeDoc())).toHaveLength(0);
  });

  it('has zero legacy warnings even for full document', () => {
    const fullDoc = makeDoc({
      tenant: { fullName: 'Ahmed', emiratesId: '784-1' },
      landlord: { name: 'WC Holdings' },
    });
    expect(legacyIds('salaryCertificate', fullDoc)).toHaveLength(0);
  });
});

// ── CROSS-TEMPLATE: UNKNOWN KEYS ─────────────────────────────────────────────

describe('evaluateCompliance — unknown template keys', () => {
  it('returns an array (not throws) for unknown template', () => {
    expect(() => evaluateCompliance('DOES_NOT_EXIST', makeDoc())).not.toThrow();
  });

  it('returns an array for empty string template key', () => {
    expect(Array.isArray(evaluateCompliance('', makeDoc()))).toBe(true);
  });

  it('returns an array for numeric key', () => {
    expect(Array.isArray(evaluateCompliance(42, makeDoc()))).toBe(true);
  });

  it('returns an array for null template key', () => {
    expect(Array.isArray(evaluateCompliance(null, makeDoc()))).toBe(true);
  });
});

// ── WARNING SHAPE CONTRACT ────────────────────────────────────────────────────

describe('evaluateCompliance — warning shape (id + severity + message)', () => {
  const templates = [
    'viewing',
    'booking',
    'bookingGov',
    'addendum',
    'tenancy',
    'invoice',
    'keyHandover',
    'offer',
  ];

  it.each(templates)('%s template: every warning has id, severity, and message', (template) => {
    const warnings = evaluateCompliance(template, makeDoc());
    expect(warnings.length).toBeGreaterThan(0);
    for (const w of warnings) {
      expect(typeof w.id).toBe('string');
      expect(w.id.length).toBeGreaterThan(0);
      expect(['critical', 'important', 'info']).toContain(w.severity);
      expect(typeof w.message).toBe('string');
      expect(w.message.length).toBeGreaterThan(0);
    }
  });
});

// ── evaluateCompliance RETURN TYPE GUARANTEES ─────────────────────────────────

describe('evaluateCompliance — always returns an array', () => {
  it('is an array for viewing', () => {
    expect(Array.isArray(evaluateCompliance('viewing', makeDoc()))).toBe(true);
  });

  it('is an array for booking', () => {
    expect(Array.isArray(evaluateCompliance('booking', makeDoc()))).toBe(true);
  });

  it('result is spreadable (not frozen)', () => {
    const w = evaluateCompliance('viewing', makeDoc());
    expect(() => [...w]).not.toThrow();
  });
});

// ── INDIVIDUAL RULE COUNTS PER TEMPLATE ──────────────────────────────────────

describe('evaluateCompliance — expected legacy warning counts on empty doc', () => {
  it('viewing has 6 legacy warnings (VIEW-1..6)', () => {
    expect(legacyIds('viewing', makeDoc())).toHaveLength(6);
  });

  it('booking has 3 legacy warnings (BOOK-1..3)', () => {
    expect(legacyIds('booking', makeDoc())).toHaveLength(3);
  });

  it('bookingGov has 2 legacy warnings (GOV-1..2)', () => {
    expect(legacyIds('bookingGov', makeDoc())).toHaveLength(2);
  });

  it('addendum has 3 legacy warnings (ADD-1..3)', () => {
    expect(legacyIds('addendum', makeDoc())).toHaveLength(3);
  });

  it('tenancy has 2 legacy warnings (TEN-1..2)', () => {
    expect(legacyIds('tenancy', makeDoc())).toHaveLength(2);
  });

  it('invoice has 1 legacy warning (INV-1)', () => {
    expect(legacyIds('invoice', makeDoc())).toHaveLength(1);
  });

  it('keyHandover has 1 legacy warning (KEY-1)', () => {
    expect(legacyIds('keyHandover', makeDoc())).toHaveLength(1);
  });

  it('offer has 6 legacy warnings (OFR-1..6)', () => {
    expect(legacyIds('offer', makeDoc())).toHaveLength(6);
  });

  it('salaryCertificate has 0 legacy warnings', () => {
    expect(legacyIds('salaryCertificate', makeDoc())).toHaveLength(0);
  });
});
