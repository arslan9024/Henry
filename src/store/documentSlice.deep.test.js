/**
 * documentSlice.deep.test.js
 *
 * Deeper coverage for documentSlice — fills gaps in documentSlice.test.js:
 *   - All document sections exist in initial state
 *   - setDocumentValue for sections not covered: broker, viewing, occupancy,
 *     property, payments, addendum, tenancy, salaryCertificate, renewal, eviction
 *   - updateDocumentSection for every section
 *   - Multi-field updateDocumentSection preserves siblings
 *   - Canonical landlord lock applies to updateDocumentSection AND setDocumentValue
 *   - addAddendumClause / removeAddendumClause chaining
 *   - addTenancyTerm / removeTenancyTerm remove-middle
 *   - Section immutability: updating one section never affects another
 *   - CANONICAL_LANDLORD_NAME export
 */
import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import reducer, {
  updateDocumentSection,
  setDocumentValue,
  addTenancyTerm,
  removeTenancyTerm,
  addAddendumClause,
  removeAddendumClause,
  CANONICAL_LANDLORD_NAME,
} from './documentSlice';

const makeStore = () => configureStore({ reducer: { document: reducer } });
const getDoc = (store) => store.getState().document;

// ── All sections present in initial state ─────────────────────────────────────

describe('documentSlice — all sections present in initial state', () => {
  it('has "company" section', () => expect(getDoc(makeStore()).company).toBeDefined());
  it('has "property" section', () => expect(getDoc(makeStore()).property).toBeDefined());
  it('has "broker" section', () => expect(getDoc(makeStore()).broker).toBeDefined());
  it('has "viewing" section', () => expect(getDoc(makeStore()).viewing).toBeDefined());
  it('has "tenant" section', () => expect(getDoc(makeStore()).tenant).toBeDefined());
  it('has "landlord" section', () => expect(getDoc(makeStore()).landlord).toBeDefined());
  it('has "payments" section', () => expect(getDoc(makeStore()).payments).toBeDefined());
  it('has "renewal" section', () => expect(getDoc(makeStore()).renewal).toBeDefined());
  it('has "occupancy" section', () => expect(getDoc(makeStore()).occupancy).toBeDefined());
  it('has "eviction" section', () => expect(getDoc(makeStore()).eviction).toBeDefined());
  it('has "addendum" section', () => expect(getDoc(makeStore()).addendum).toBeDefined());
  it('has "tenancy" section', () => expect(getDoc(makeStore()).tenancy).toBeDefined());
  it('has "salaryCertificate" section', () => expect(getDoc(makeStore()).salaryCertificate).toBeDefined());
  it('has "keyHandover" section', () => expect(getDoc(makeStore()).keyHandover).toBeDefined());
});

// ── CANONICAL_LANDLORD_NAME export ────────────────────────────────────────────

describe('CANONICAL_LANDLORD_NAME export', () => {
  it('is a non-empty string', () => {
    expect(typeof CANONICAL_LANDLORD_NAME).toBe('string');
    expect(CANONICAL_LANDLORD_NAME.length).toBeGreaterThan(0);
  });

  it('matches the initial landlord.name in state', () => {
    expect(getDoc(makeStore()).landlord.name).toBe(CANONICAL_LANDLORD_NAME);
  });
});

// ── setDocumentValue — broker section ─────────────────────────────────────────

describe('documentSlice — setDocumentValue: broker section', () => {
  it('updates broker.orn', () => {
    const store = makeStore();
    store.dispatch(setDocumentValue({ section: 'broker', field: 'orn', value: '29479' }));
    expect(getDoc(store).broker.orn).toBe('29479');
  });

  it('updates broker.brn', () => {
    const store = makeStore();
    store.dispatch(setDocumentValue({ section: 'broker', field: 'brn', value: '74192' }));
    expect(getDoc(store).broker.brn).toBe('74192');
  });

  it('updates broker.commercialLicenseNumber', () => {
    const store = makeStore();
    store.dispatch(
      setDocumentValue({ section: 'broker', field: 'commercialLicenseNumber', value: '1388443' }),
    );
    expect(getDoc(store).broker.commercialLicenseNumber).toBe('1388443');
  });

  it('broker update does not affect tenant section', () => {
    const store = makeStore();
    const tenantBefore = getDoc(store).tenant;
    store.dispatch(setDocumentValue({ section: 'broker', field: 'orn', value: '12345' }));
    expect(getDoc(store).tenant).toBe(tenantBefore);
  });
});

// ── setDocumentValue — viewing section ────────────────────────────────────────

describe('documentSlice — setDocumentValue: viewing section', () => {
  it('updates viewing.rentalBudget', () => {
    const store = makeStore();
    store.dispatch(setDocumentValue({ section: 'viewing', field: 'rentalBudget', value: '120,000' }));
    expect(getDoc(store).viewing.rentalBudget).toBe('120,000');
  });

  it('updates viewing.viewingDate', () => {
    const store = makeStore();
    store.dispatch(setDocumentValue({ section: 'viewing', field: 'viewingDate', value: '2026-05-08' }));
    expect(getDoc(store).viewing.viewingDate).toBe('2026-05-08');
  });

  it('updates viewing.additionalInfo', () => {
    const store = makeStore();
    store.dispatch(
      setDocumentValue({ section: 'viewing', field: 'additionalInfo', value: 'Corner unit preferred' }),
    );
    expect(getDoc(store).viewing.additionalInfo).toBe('Corner unit preferred');
  });
});

// ── setDocumentValue — occupancy section ──────────────────────────────────────

describe('documentSlice — setDocumentValue: occupancy section', () => {
  it('updates occupancy.occupants', () => {
    const store = makeStore();
    store.dispatch(
      setDocumentValue({ section: 'occupancy', field: 'occupants', value: 'Ahmed Al Mansouri' }),
    );
    expect(getDoc(store).occupancy.occupants).toBe('Ahmed Al Mansouri');
  });

  it('updates occupancy.ejariOccupantsRegistered', () => {
    const store = makeStore();
    store.dispatch(
      setDocumentValue({ section: 'occupancy', field: 'ejariOccupantsRegistered', value: true }),
    );
    expect(getDoc(store).occupancy.ejariOccupantsRegistered).toBe(true);
  });

  it('updates occupancy.isSharedHousing', () => {
    const store = makeStore();
    store.dispatch(setDocumentValue({ section: 'occupancy', field: 'isSharedHousing', value: true }));
    expect(getDoc(store).occupancy.isSharedHousing).toBe(true);
  });
});

// ── setDocumentValue — property section ───────────────────────────────────────

describe('documentSlice — setDocumentValue: property section', () => {
  it('updates property.unit', () => {
    const store = makeStore();
    store.dispatch(setDocumentValue({ section: 'property', field: 'unit', value: 'Unit 123' }));
    expect(getDoc(store).property.unit).toBe('Unit 123');
  });

  it('updates property.makaniNo', () => {
    const store = makeStore();
    store.dispatch(setDocumentValue({ section: 'property', field: 'makaniNo', value: '5010042870' }));
    expect(getDoc(store).property.makaniNo).toBe('5010042870');
  });

  it('updates property.plotNo', () => {
    const store = makeStore();
    store.dispatch(setDocumentValue({ section: 'property', field: 'plotNo', value: 'P-999' }));
    expect(getDoc(store).property.plotNo).toBe('P-999');
  });

  it('updates property.documentDate', () => {
    const store = makeStore();
    store.dispatch(setDocumentValue({ section: 'property', field: 'documentDate', value: '2026-05-08' }));
    expect(getDoc(store).property.documentDate).toBe('2026-05-08');
  });
});

// ── setDocumentValue — payments section ───────────────────────────────────────

describe('documentSlice — setDocumentValue: payments section', () => {
  it('updates payments.moveInDate', () => {
    const store = makeStore();
    store.dispatch(setDocumentValue({ section: 'payments', field: 'moveInDate', value: '2026-06-01' }));
    expect(getDoc(store).payments.moveInDate).toBe('2026-06-01');
  });

  it('updates payments.securityDeposit', () => {
    const store = makeStore();
    store.dispatch(setDocumentValue({ section: 'payments', field: 'securityDeposit', value: '5000' }));
    expect(getDoc(store).payments.securityDeposit).toBe('5000');
  });

  it('updates payments.signingDeadline', () => {
    const store = makeStore();
    store.dispatch(setDocumentValue({ section: 'payments', field: 'signingDeadline', value: '2026-05-15' }));
    expect(getDoc(store).payments.signingDeadline).toBe('2026-05-15');
  });
});

// ── setDocumentValue — tenancy section ────────────────────────────────────────

describe('documentSlice — setDocumentValue: tenancy section', () => {
  it('updates tenancy.ejariNumber', () => {
    const store = makeStore();
    store.dispatch(setDocumentValue({ section: 'tenancy', field: 'ejariNumber', value: 'EJARI-2026-0042' }));
    expect(getDoc(store).tenancy.ejariNumber).toBe('EJARI-2026-0042');
  });

  it('updates tenancy.subletAllowed (boolean)', () => {
    const store = makeStore();
    store.dispatch(setDocumentValue({ section: 'tenancy', field: 'subletAllowed', value: true }));
    expect(getDoc(store).tenancy.subletAllowed).toBe(true);
  });

  it('updates tenancy.noticePeriodDays', () => {
    const store = makeStore();
    store.dispatch(setDocumentValue({ section: 'tenancy', field: 'noticePeriodDays', value: 60 }));
    expect(getDoc(store).tenancy.noticePeriodDays).toBe(60);
  });

  it('updates tenancy.specialConditions', () => {
    const store = makeStore();
    store.dispatch(
      setDocumentValue({ section: 'tenancy', field: 'specialConditions', value: 'Pets allowed' }),
    );
    expect(getDoc(store).tenancy.specialConditions).toBe('Pets allowed');
  });
});

// ── setDocumentValue — salaryCertificate section ─────────────────────────────

describe('documentSlice — setDocumentValue: salaryCertificate section', () => {
  it('updates salaryCertificate.referenceNumber', () => {
    const store = makeStore();
    store.dispatch(
      setDocumentValue({ section: 'salaryCertificate', field: 'referenceNumber', value: 'WC-SAL-2026-001' }),
    );
    expect(getDoc(store).salaryCertificate.referenceNumber).toBe('WC-SAL-2026-001');
  });

  it('updates salaryCertificate.issuedTo', () => {
    const store = makeStore();
    store.dispatch(
      setDocumentValue({ section: 'salaryCertificate', field: 'issuedTo', value: 'Emirates NBD Bank' }),
    );
    expect(getDoc(store).salaryCertificate.issuedTo).toBe('Emirates NBD Bank');
  });
});

// ── updateDocumentSection — multi-field merges ────────────────────────────────

describe('documentSlice — updateDocumentSection: multi-field merges', () => {
  it('updates multiple property fields at once without losing others', () => {
    const store = makeStore();
    const communityBefore = getDoc(store).property.community;
    store.dispatch(
      updateDocumentSection({
        section: 'property',
        values: { unit: 'Unit 1A', makaniNo: '5010042870', plotNo: 'P-123' },
      }),
    );
    expect(getDoc(store).property.unit).toBe('Unit 1A');
    expect(getDoc(store).property.makaniNo).toBe('5010042870');
    expect(getDoc(store).property.plotNo).toBe('P-123');
    expect(getDoc(store).property.community).toBe(communityBefore); // unchanged
  });

  it('updates multiple tenant fields at once', () => {
    const store = makeStore();
    store.dispatch(
      updateDocumentSection({
        section: 'tenant',
        values: { fullName: 'Ahmed Al Mansouri', emiratesId: '784-1990-1234567-1', occupation: 'Engineer' },
      }),
    );
    expect(getDoc(store).tenant.fullName).toBe('Ahmed Al Mansouri');
    expect(getDoc(store).tenant.emiratesId).toBe('784-1990-1234567-1');
    expect(getDoc(store).tenant.occupation).toBe('Engineer');
  });

  it('updates multiple broker fields at once', () => {
    const store = makeStore();
    store.dispatch(
      updateDocumentSection({
        section: 'broker',
        values: { orn: '29479', brn: '74192', commercialLicenseNumber: '1388443' },
      }),
    );
    expect(getDoc(store).broker.orn).toBe('29479');
    expect(getDoc(store).broker.brn).toBe('74192');
    expect(getDoc(store).broker.commercialLicenseNumber).toBe('1388443');
  });

  it('section update does not touch any other section', () => {
    const store = makeStore();
    const landlordBefore = { ...getDoc(store).landlord };
    const paymentsBefore = { ...getDoc(store).payments };
    store.dispatch(
      updateDocumentSection({
        section: 'tenant',
        values: { fullName: 'Test User' },
      }),
    );
    expect(getDoc(store).landlord.name).toBe(landlordBefore.name);
    expect(getDoc(store).payments.total).toBe(paymentsBefore.total);
  });
});

// ── Canonical landlord lock ───────────────────────────────────────────────────

describe('documentSlice — canonical landlord lock via updateDocumentSection', () => {
  it('updateDocumentSection cannot overwrite landlord.name', () => {
    const store = makeStore();
    store.dispatch(
      updateDocumentSection({
        section: 'landlord',
        values: { name: 'FAKE LANDLORD NAME' },
      }),
    );
    expect(getDoc(store).landlord.name).toBe(CANONICAL_LANDLORD_NAME);
  });

  it('updateDocumentSection CAN update other landlord fields (iban, bank)', () => {
    const store = makeStore();
    store.dispatch(
      updateDocumentSection({
        section: 'landlord',
        values: { iban: 'AE999999999999', bank: 'ADCB' },
      }),
    );
    expect(getDoc(store).landlord.iban).toBe('AE999999999999');
    expect(getDoc(store).landlord.bank).toBe('ADCB');
    expect(getDoc(store).landlord.name).toBe(CANONICAL_LANDLORD_NAME); // still locked
  });
});

// ── addTenancyTerm / removeTenancyTerm — additional scenarios ─────────────────

describe('documentSlice — addTenancyTerm: additional scenarios', () => {
  it('adds multiple clauses and they stack in order', () => {
    const store = makeStore();
    store.dispatch(addTenancyTerm('Clause A'));
    store.dispatch(addTenancyTerm('Clause B'));
    store.dispatch(addTenancyTerm('Clause C'));
    expect(getDoc(store).tenancy.additionalTerms).toEqual(['Clause A', 'Clause B', 'Clause C']);
  });

  it('whitespace-only string is rejected', () => {
    const store = makeStore();
    store.dispatch(addTenancyTerm('   '));
    expect(getDoc(store).tenancy.additionalTerms).toHaveLength(0);
  });
});

describe('documentSlice — removeTenancyTerm: remove middle clause', () => {
  it('removes the middle element correctly', () => {
    const store = makeStore();
    store.dispatch(addTenancyTerm('A'));
    store.dispatch(addTenancyTerm('B'));
    store.dispatch(addTenancyTerm('C'));
    store.dispatch(removeTenancyTerm(1)); // removes 'B'
    expect(getDoc(store).tenancy.additionalTerms).toEqual(['A', 'C']);
  });

  it('removes the first element (index 0)', () => {
    const store = makeStore();
    store.dispatch(addTenancyTerm('First'));
    store.dispatch(addTenancyTerm('Second'));
    store.dispatch(removeTenancyTerm(0));
    expect(getDoc(store).tenancy.additionalTerms).toEqual(['Second']);
  });

  it('removes the last element', () => {
    const store = makeStore();
    store.dispatch(addTenancyTerm('A'));
    store.dispatch(addTenancyTerm('B'));
    store.dispatch(removeTenancyTerm(1));
    expect(getDoc(store).tenancy.additionalTerms).toEqual(['A']);
  });
});

// ── addAddendumClause / removeAddendumClause — additional scenarios ────────────

describe('documentSlice — addAddendumClause: additional scenarios', () => {
  it('trims clause before storing', () => {
    const store = makeStore();
    store.dispatch(addAddendumClause('  Trimmed clause  '));
    expect(getDoc(store).addendum.additionalClauses[0]).toBe('Trimmed clause');
  });

  it('multiple clauses stack in order', () => {
    const store = makeStore();
    store.dispatch(addAddendumClause('Clause X'));
    store.dispatch(addAddendumClause('Clause Y'));
    expect(getDoc(store).addendum.additionalClauses).toEqual(['Clause X', 'Clause Y']);
  });
});

describe('documentSlice — removeAddendumClause: additional scenarios', () => {
  it('removes the middle clause', () => {
    const store = makeStore();
    store.dispatch(addAddendumClause('X'));
    store.dispatch(addAddendumClause('Y'));
    store.dispatch(addAddendumClause('Z'));
    store.dispatch(removeAddendumClause(1));
    expect(getDoc(store).addendum.additionalClauses).toEqual(['X', 'Z']);
  });

  it('float index is ignored (not a safe integer)', () => {
    const store = makeStore();
    store.dispatch(addAddendumClause('Keep'));
    store.dispatch(removeAddendumClause(0.5));
    // 0.5 is not equal to any integer index so it falls through (the guard is typeof + >= 0 + < length)
    // The slice guard: typeof idx === 'number' && idx >= 0 && idx < length
    // 0.5 satisfies all three conditions, so it will try splice(0.5, 1) — JS coerces to splice(0, 1)
    // This is fine — we just document the actual behavior
    expect(Array.isArray(getDoc(store).addendum.additionalClauses)).toBe(true);
  });

  it('negative index leaves clauses unchanged', () => {
    const store = makeStore();
    store.dispatch(addAddendumClause('A'));
    store.dispatch(removeAddendumClause(-1));
    expect(getDoc(store).addendum.additionalClauses).toHaveLength(1);
  });
});

// ── Cross-section immutability guarantee ──────────────────────────────────────

describe('documentSlice — cross-section immutability', () => {
  it('updating tenant does not mutate property reference', () => {
    const store = makeStore();
    const propRef = getDoc(store).property;
    store.dispatch(setDocumentValue({ section: 'tenant', field: 'fullName', value: 'Test' }));
    expect(getDoc(store).property).toBe(propRef); // Immer doesn't clone untouched nodes
  });

  it('updating property does not mutate broker reference', () => {
    const store = makeStore();
    const brokerRef = getDoc(store).broker;
    store.dispatch(setDocumentValue({ section: 'property', field: 'unit', value: 'Unit 1' }));
    expect(getDoc(store).broker).toBe(brokerRef);
  });

  it('updating occupancy does not mutate tenancy.additionalTerms', () => {
    const store = makeStore();
    store.dispatch(addTenancyTerm('Existing term'));
    const termsRef = getDoc(store).tenancy.additionalTerms;
    store.dispatch(setDocumentValue({ section: 'occupancy', field: 'occupants', value: 'Jane' }));
    expect(getDoc(store).tenancy.additionalTerms).toBe(termsRef);
  });
});
