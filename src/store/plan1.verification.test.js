/**
 * Plan 1 Step 7 — Verification tests
 *
 * Covers:
 *   1. documentSlice — tenancy section defaults and null-safety
 *   2. documentSlice — addendum section locked defaults
 *   3. documentSlice — additionalTerms / additionalClauses array reducers
 *   4. documentSlice — setDocumentValue guards (unknown section ignored)
 *   5. uiSlice — preview readiness state machine transitions
 *   6. compliance ruleEngine — ADD-1/ADD-2/ADD-3 evaluators
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import documentReducer, {
  setDocumentValue,
  updateDocumentSection,
  addTenancyTerm,
  removeTenancyTerm,
  addAddendumClause,
  removeAddendumClause,
} from './documentSlice';
import uiReducer, {
  setPreviewRendering,
  setPreviewReady,
  setPreviewError,
  resetPreviewStatus,
  selectPreviewState,
  selectIsPreviewReady,
} from './uiSlice';
import { evaluateCompliance } from '../compliance/ruleEngine';

// ─── helpers ─────────────────────────────────────────────────────────────────

const makeDocStore = () => configureStore({ reducer: { document: documentReducer } });

const makeUiStore = () => configureStore({ reducer: { ui: uiReducer } });

const selectDoc = (store) => store.getState().document;

// ─── 1. Tenancy section defaults ─────────────────────────────────────────────

describe('documentSlice › tenancy section', () => {
  let store;
  beforeEach(() => {
    store = makeDocStore();
  });

  it('has an additionalTerms array by default (null-safe fallback)', () => {
    const { tenancy } = selectDoc(store);
    expect(Array.isArray(tenancy.additionalTerms)).toBe(true);
    expect(tenancy.additionalTerms.length).toBe(0);
  });

  it('addTenancyTerm appends a term string', () => {
    store.dispatch(addTenancyTerm('No pets allowed.'));
    store.dispatch(addTenancyTerm('Parking space B-12 included.'));
    const { tenancy } = selectDoc(store);
    expect(tenancy.additionalTerms).toHaveLength(2);
    expect(tenancy.additionalTerms[0]).toBe('No pets allowed.');
  });

  it('removeTenancyTerm removes by index', () => {
    store.dispatch(addTenancyTerm('Alpha'));
    store.dispatch(addTenancyTerm('Beta'));
    store.dispatch(removeTenancyTerm(0));
    const { tenancy } = selectDoc(store);
    expect(tenancy.additionalTerms).toHaveLength(1);
    expect(tenancy.additionalTerms[0]).toBe('Beta');
  });

  it('setDocumentValue updates a tenancy scalar field', () => {
    // ejariNumber is a real tenancy field in the initialState
    store.dispatch(setDocumentValue({ section: 'tenancy', field: 'ejariNumber', value: 'EJARI-2026-001' }));
    expect(selectDoc(store).tenancy.ejariNumber).toBe('EJARI-2026-001');
  });

  it('setDocumentValue for an out-of-range tenancy field is a safe no-op', () => {
    const before = JSON.stringify(selectDoc(store).tenancy);
    store.dispatch(setDocumentValue({ section: 'tenancy', field: '__nonexistent__', value: 'x' }));
    // State shape must not grow
    expect(JSON.stringify(selectDoc(store).tenancy)).toBe(before);
  });
});

// ─── 2. Addendum locked defaults ────────────────────────────────────────────

describe('documentSlice › addendum section — locked defaults', () => {
  let store;
  beforeEach(() => {
    store = makeDocStore();
  });

  it('securityDeposit defaults to 4000 (AED — White Caves policy)', () => {
    expect(selectDoc(store).addendum.securityDeposit).toBe(4000);
  });

  it('renewalCharges defaults to 1050 (AED incl. VAT)', () => {
    expect(selectDoc(store).addendum.renewalCharges).toBe(1050);
  });

  it('maintenanceCap defaults to 1000 (AED threshold)', () => {
    expect(selectDoc(store).addendum.maintenanceCap).toBe(1000);
  });

  it('noticePeriodDays defaults to 90', () => {
    expect(selectDoc(store).addendum.noticePeriodDays).toBe(90);
  });

  it('legalReference defaults to Dubai Law 26/2007', () => {
    expect(selectDoc(store).addendum.legalReference).toMatch(/26 of 2007/);
  });

  it('landlordServices is a non-empty array with the bundle', () => {
    const { landlordServices } = selectDoc(store).addendum;
    expect(Array.isArray(landlordServices)).toBe(true);
    expect(landlordServices.length).toBeGreaterThanOrEqual(3);
    // Painting / cleaning / AC are always present
    const joined = landlordServices.join(' ').toLowerCase();
    expect(joined).toMatch(/cleaning|painting|ac/i);
  });

  it('additionalClauses starts empty', () => {
    expect(selectDoc(store).addendum.additionalClauses).toEqual([]);
  });
});

// ─── 3. Addendum clause reducers ─────────────────────────────────────────────

describe('documentSlice › addAddendumClause / removeAddendumClause', () => {
  let store;
  beforeEach(() => {
    store = makeDocStore();
  });

  it('addAddendumClause appends a string clause', () => {
    store.dispatch(addAddendumClause('Tenant may not sublet the premises.'));
    const { additionalClauses } = selectDoc(store).addendum;
    expect(additionalClauses).toHaveLength(1);
    expect(additionalClauses[0]).toBe('Tenant may not sublet the premises.');
  });

  it('removeAddendumClause removes the clause at the given index', () => {
    store.dispatch(addAddendumClause('Clause A'));
    store.dispatch(addAddendumClause('Clause B'));
    store.dispatch(removeAddendumClause(0));
    expect(selectDoc(store).addendum.additionalClauses).toEqual(['Clause B']);
  });

  it('removeAddendumClause with invalid index leaves array unchanged', () => {
    store.dispatch(addAddendumClause('Only clause'));
    store.dispatch(removeAddendumClause(99));
    expect(selectDoc(store).addendum.additionalClauses).toHaveLength(1);
  });
});

// ─── 4. setDocumentValue guard — unknown section ─────────────────────────────

describe('documentSlice › setDocumentValue guards', () => {
  it('silently ignores updates to an unknown section', () => {
    const store = makeDocStore();
    const before = JSON.stringify(store.getState().document);
    store.dispatch(setDocumentValue({ section: '__ghost__', field: 'x', value: 'y' }));
    expect(JSON.stringify(store.getState().document)).toBe(before);
  });

  it('silently ignores updates to a known section for an unknown field', () => {
    const store = makeDocStore();
    const before = JSON.stringify(store.getState().document.property);
    store.dispatch(setDocumentValue({ section: 'property', field: '__ghost__', value: 'y' }));
    expect(JSON.stringify(store.getState().document.property)).toBe(before);
  });
});

// ─── 5. uiSlice — preview readiness state machine ────────────────────────────

describe('uiSlice › preview readiness state machine', () => {
  let store;
  beforeEach(() => {
    store = makeUiStore();
  });

  it('starts in idle status and is NOT ready', () => {
    expect(selectPreviewState(store.getState()).status).toBe('idle');
    expect(selectIsPreviewReady(store.getState())).toBe(false);
  });

  it('setPreviewRendering → status=rendering, not ready', () => {
    store.dispatch(setPreviewRendering());
    expect(selectPreviewState(store.getState()).status).toBe('rendering');
    expect(selectIsPreviewReady(store.getState())).toBe(false);
  });

  it('setPreviewReady → status=ready, isPreviewReady=true, lastRenderedAt set', () => {
    store.dispatch(setPreviewRendering());
    store.dispatch(setPreviewReady());
    const preview = selectPreviewState(store.getState());
    expect(preview.status).toBe('ready');
    expect(selectIsPreviewReady(store.getState())).toBe(true);
    expect(preview.lastRenderedAt).toBeTruthy();
  });

  it('setPreviewError → status=error, NOT ready', () => {
    store.dispatch(setPreviewRendering());
    store.dispatch(setPreviewError());
    expect(selectPreviewState(store.getState()).status).toBe('error');
    expect(selectIsPreviewReady(store.getState())).toBe(false);
  });

  it('resetPreviewStatus returns to idle', () => {
    store.dispatch(setPreviewReady());
    store.dispatch(resetPreviewStatus());
    expect(selectPreviewState(store.getState()).status).toBe('idle');
    expect(selectIsPreviewReady(store.getState())).toBe(false);
  });
});

// ─── 6. Compliance evaluators — addendum ADD-1/ADD-2/ADD-3 ──────────────────

describe('evaluateCompliance › addendum rules', () => {
  // Minimal document shape needed by the addendum evaluators
  const baseDoc = () => ({
    property: { unit: 'Unit 123', community: 'Damac Hills 2', documentDate: '2026-05-01' },
    tenant: { fullName: 'Ahmad Al-Rashidi', emiratesId: '784-1988-1234567-1' },
    addendum: {
      originalContractRef: 'WC-2026-TC-0042',
      effectiveDate: '2026-05-01',
      securityDeposit: 4000,
      renewalCharges: 1050,
      maintenanceCap: 1000,
      noticePeriodDays: 90,
      legalReference: 'Dubai Law No. 26 of 2007',
      additionalClauses: [],
      landlordServices: [],
      witnessName: '',
      witnessIdNo: '',
    },
    company: {},
    landlord: { name: 'Muhammad Naeem' },
    payments: {},
    broker: {},
    viewing: {},
    occupancy: {},
    eviction: {},
  });

  it('passes all addendum rules when data is complete', () => {
    const warnings = evaluateCompliance('addendum', baseDoc());
    const addendumWarnings = warnings.filter((w) => w.id.startsWith('ADD-'));
    expect(addendumWarnings).toHaveLength(0);
  });

  it('ADD-1 fires when addendum.originalContractRef is empty', () => {
    const doc = baseDoc();
    doc.addendum.originalContractRef = '';
    const warnings = evaluateCompliance('addendum', doc);
    expect(warnings.some((w) => w.id === 'ADD-1')).toBe(true);
  });

  it('ADD-1 does NOT fire when addendum.originalContractRef is set', () => {
    const doc = baseDoc();
    doc.addendum.originalContractRef = 'WC-2026-TC-0042';
    const warnings = evaluateCompliance('addendum', doc);
    expect(warnings.some((w) => w.id === 'ADD-1')).toBe(false);
  });

  it('ADD-2 fires when tenant.fullName is empty', () => {
    const doc = baseDoc();
    doc.tenant.fullName = '';
    const warnings = evaluateCompliance('addendum', doc);
    expect(warnings.some((w) => w.id === 'ADD-2')).toBe(true);
  });

  it('ADD-3 fires when addendum.effectiveDate is empty', () => {
    const doc = baseDoc();
    doc.addendum.effectiveDate = '';
    const warnings = evaluateCompliance('addendum', doc);
    expect(warnings.some((w) => w.id === 'ADD-3')).toBe(true);
  });

  it('ADD-3 does NOT fire when addendum.effectiveDate is set', () => {
    const doc = baseDoc();
    doc.addendum.effectiveDate = '2026-05-01';
    const warnings = evaluateCompliance('addendum', doc);
    expect(warnings.some((w) => w.id === 'ADD-3')).toBe(false);
  });
});

// ─── 7. Compliance evaluators — VIEW-3/VIEW-4/VIEW-6 (regression) ───────────

describe('evaluateCompliance › viewing rules (regression)', () => {
  const baseViewDoc = () => ({
    property: {
      unit: 'Unit 449',
      community: 'Damac Hills 2',
      documentDate: '2026-04-22',
      makaniNo: '12345',
      plotNo: '7890',
    },
    tenant: { fullName: 'Sarah Mitchell', emiratesId: '784-1980-9876543-1', passportNo: '' },
    broker: { orn: 'ORN123', brn: 'BRN456', commercialLicenseNumber: '1388443' },
    viewing: { rentalBudget: 90000 },
    company: {},
    landlord: {},
    payments: {},
    addendum: {},
    occupancy: {},
    eviction: {},
  });

  it('passes all critical VIEW rules when data is complete', () => {
    const warnings = evaluateCompliance('viewing', baseViewDoc());
    const critical = warnings.filter((w) => w.severity === 'critical');
    expect(critical).toHaveLength(0);
  });

  it('VIEW-3 fires when broker ORN is missing', () => {
    const doc = baseViewDoc();
    doc.broker.orn = '';
    const warnings = evaluateCompliance('viewing', doc);
    expect(warnings.some((w) => w.id === 'VIEW-3')).toBe(true);
  });

  it('VIEW-4 passes when tenant has either emiratesId OR passportNo', () => {
    const doc = baseViewDoc();
    doc.tenant.emiratesId = '';
    doc.tenant.passportNo = 'A12345678';
    const warnings = evaluateCompliance('viewing', doc);
    expect(warnings.some((w) => w.id === 'VIEW-4')).toBe(false);
  });

  it('VIEW-4 fires when tenant has neither emiratesId nor passportNo', () => {
    const doc = baseViewDoc();
    doc.tenant.emiratesId = '';
    doc.tenant.passportNo = '';
    const warnings = evaluateCompliance('viewing', doc);
    expect(warnings.some((w) => w.id === 'VIEW-4')).toBe(true);
  });

  it('VIEW-6 fires when rentalBudget is not set', () => {
    const doc = baseViewDoc();
    doc.viewing.rentalBudget = null;
    const warnings = evaluateCompliance('viewing', doc);
    expect(warnings.some((w) => w.id === 'VIEW-6')).toBe(true);
  });
});
