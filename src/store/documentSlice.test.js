import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import documentReducer, {
  updateDocumentSection,
  setDocumentValue,
  addTenancyTerm,
  removeTenancyTerm,
  addAddendumClause,
  removeAddendumClause,
  CANONICAL_LANDLORD_NAME,
} from './documentSlice';

const makeStore = () => configureStore({ reducer: { document: documentReducer } });

describe('documentSlice — initial state', () => {
  it('exposes White Caves company defaults', () => {
    const { document } = makeStore().getState();
    expect(document.company.name).toMatch(/white caves/i);
    expect(document.company.dedLicense).toBe('1388443');
  });

  it('seeds the canonical landlord name', () => {
    const { document } = makeStore().getState();
    expect(document.landlord.name).toBe(CANONICAL_LANDLORD_NAME);
  });

  it('contains all sections the rule engine reads', () => {
    const { document } = makeStore().getState();
    for (const key of [
      'company',
      'property',
      'broker',
      'viewing',
      'tenant',
      'landlord',
      'payments',
      'renewal',
      'occupancy',
      'eviction',
    ]) {
      expect(document).toHaveProperty(key);
    }
  });
});

describe('documentSlice — updateDocumentSection', () => {
  it('merges fields into the named section without dropping siblings', () => {
    const store = makeStore();
    const before = store.getState().document.tenant;
    store.dispatch(
      updateDocumentSection({
        section: 'tenant',
        values: { fullName: 'Jane Doe', emiratesId: '784-...' },
      }),
    );
    const after = store.getState().document.tenant;
    expect(after.fullName).toBe('Jane Doe');
    expect(after.emiratesId).toBe('784-...');
    // Unrelated field preserved.
    expect(after.occupation).toBe(before.occupation);
  });

  it('forces canonical landlord name even if caller tries to overwrite it', () => {
    const store = makeStore();
    store.dispatch(
      updateDocumentSection({
        section: 'landlord',
        values: { name: 'IMPOSTER', email: 'a@b.com' },
      }),
    );
    const { landlord } = store.getState().document;
    expect(landlord.name).toBe(CANONICAL_LANDLORD_NAME); // protected
    expect(landlord.email).toBe('a@b.com'); // other fields still updated
  });
});

describe('documentSlice — setDocumentValue', () => {
  it('updates a single field when section + field both exist', () => {
    const store = makeStore();
    store.dispatch(setDocumentValue({ section: 'property', field: 'unit', value: 'Unit 999' }));
    expect(store.getState().document.property.unit).toBe('Unit 999');
  });

  it('forces canonical landlord name on the landlord.name path', () => {
    const store = makeStore();
    store.dispatch(setDocumentValue({ section: 'landlord', field: 'name', value: 'IMPOSTER' }));
    expect(store.getState().document.landlord.name).toBe(CANONICAL_LANDLORD_NAME);
  });

  it('silently ignores unknown sections', () => {
    const store = makeStore();
    const before = store.getState().document;
    store.dispatch(setDocumentValue({ section: 'nope', field: 'x', value: 'y' }));
    expect(store.getState().document).toEqual(before);
  });

  it('silently ignores unknown fields within a known section', () => {
    const store = makeStore();
    const before = store.getState().document.property;
    store.dispatch(setDocumentValue({ section: 'property', field: 'doesNotExist', value: 'x' }));
    expect(store.getState().document.property).toEqual(before);
  });
});

describe('documentSlice — addTenancyTerm / removeTenancyTerm', () => {
  it('appends a non-empty clause string', () => {
    const store = makeStore();
    store.dispatch(addTenancyTerm('No pets allowed.'));
    const terms = store.getState().document.tenancy.additionalTerms;
    expect(terms).toContain('No pets allowed.');
  });

  it('trims leading/trailing whitespace before pushing', () => {
    const store = makeStore();
    store.dispatch(addTenancyTerm('  Clause A  '));
    expect(store.getState().document.tenancy.additionalTerms).toContain('Clause A');
  });

  it('ignores an empty or whitespace-only string', () => {
    const store = makeStore();
    const before = store.getState().document.tenancy.additionalTerms.length;
    store.dispatch(addTenancyTerm('   '));
    expect(store.getState().document.tenancy.additionalTerms).toHaveLength(before);
  });

  it('ignores non-string payloads (e.g. null)', () => {
    const store = makeStore();
    const before = store.getState().document.tenancy.additionalTerms.length;
    store.dispatch(addTenancyTerm(null));
    expect(store.getState().document.tenancy.additionalTerms).toHaveLength(before);
  });

  it('removes a clause by valid index', () => {
    const store = makeStore();
    store.dispatch(addTenancyTerm('First'));
    store.dispatch(addTenancyTerm('Second'));
    store.dispatch(removeTenancyTerm(0));
    const terms = store.getState().document.tenancy.additionalTerms;
    expect(terms).not.toContain('First');
    expect(terms).toContain('Second');
  });

  it('ignores removal with out-of-range index', () => {
    const store = makeStore();
    store.dispatch(addTenancyTerm('Only'));
    store.dispatch(removeTenancyTerm(99));
    expect(store.getState().document.tenancy.additionalTerms).toHaveLength(1);
  });

  it('ignores removal with negative index', () => {
    const store = makeStore();
    store.dispatch(addTenancyTerm('Clause'));
    store.dispatch(removeTenancyTerm(-1));
    expect(store.getState().document.tenancy.additionalTerms).toHaveLength(1);
  });

  it('ignores removal with non-number index', () => {
    const store = makeStore();
    store.dispatch(addTenancyTerm('Clause'));
    store.dispatch(removeTenancyTerm('0'));
    expect(store.getState().document.tenancy.additionalTerms).toHaveLength(1);
  });
});

describe('documentSlice — addAddendumClause / removeAddendumClause', () => {
  it('appends a non-empty addendum clause', () => {
    const store = makeStore();
    store.dispatch(addAddendumClause('No sub-letting.'));
    expect(store.getState().document.addendum.additionalClauses).toContain('No sub-letting.');
  });

  it('trims whitespace before pushing addendum clause', () => {
    const store = makeStore();
    store.dispatch(addAddendumClause('  Trim me  '));
    expect(store.getState().document.addendum.additionalClauses).toContain('Trim me');
  });

  it('ignores an empty addendum clause', () => {
    const store = makeStore();
    const before = store.getState().document.addendum.additionalClauses.length;
    store.dispatch(addAddendumClause(''));
    expect(store.getState().document.addendum.additionalClauses).toHaveLength(before);
  });

  it('ignores non-string addendum clause payloads', () => {
    const store = makeStore();
    const before = store.getState().document.addendum.additionalClauses.length;
    store.dispatch(addAddendumClause(42));
    expect(store.getState().document.addendum.additionalClauses).toHaveLength(before);
  });

  it('removes an addendum clause by valid index', () => {
    const store = makeStore();
    store.dispatch(addAddendumClause('Alpha'));
    store.dispatch(addAddendumClause('Beta'));
    store.dispatch(removeAddendumClause(0));
    expect(store.getState().document.addendum.additionalClauses).not.toContain('Alpha');
    expect(store.getState().document.addendum.additionalClauses).toContain('Beta');
  });

  it('ignores addendum removal with out-of-range index', () => {
    const store = makeStore();
    store.dispatch(addAddendumClause('Solo'));
    store.dispatch(removeAddendumClause(5));
    expect(store.getState().document.addendum.additionalClauses).toHaveLength(1);
  });
});

describe('documentSlice — keyHandover section', () => {
  it('exists in initial state with expected fields', () => {
    const { document } = makeStore().getState();
    expect(document.keyHandover).toBeDefined();
    expect(document.keyHandover.referenceNumber).toBe('');
    expect(document.keyHandover.handoverDate).toBe('');
    expect(document.keyHandover.wallsCondition).toBe('Good');
    expect(document.keyHandover.acCondition).toBe('Serviced');
    expect(document.keyHandover.cleaningStatus).toBe('Professional');
    expect(document.keyHandover.cleaningNotes).toBe('Ready to move');
  });

  it('setDocumentValue updates keyHandover fields', () => {
    const store = makeStore();
    store.dispatch(setDocumentValue({ section: 'keyHandover', field: 'handoverDate', value: '01 May 2026' }));
    store.dispatch(
      setDocumentValue({ section: 'keyHandover', field: 'tenantName', value: 'Ahmed Al Mansouri' }),
    );
    const { keyHandover } = store.getState().document;
    expect(keyHandover.handoverDate).toBe('01 May 2026');
    expect(keyHandover.tenantName).toBe('Ahmed Al Mansouri');
  });

  it('setDocumentValue silently ignores undeclared keyHandover fields', () => {
    const store = makeStore();
    const before = store.getState().document.keyHandover;
    store.dispatch(setDocumentValue({ section: 'keyHandover', field: 'notAField', value: 'x' }));
    expect(store.getState().document.keyHandover).toEqual(before);
  });

  it('updateDocumentSection merges keyHandover fields', () => {
    const store = makeStore();
    store.dispatch(
      updateDocumentSection({
        section: 'keyHandover',
        values: { propertyAddress: 'Unit 449, Avencia-2, Damac Hills 2', securityDeposit: 'AED 4,250' },
      }),
    );
    const { keyHandover } = store.getState().document;
    expect(keyHandover.propertyAddress).toBe('Unit 449, Avencia-2, Damac Hills 2');
    expect(keyHandover.securityDeposit).toBe('AED 4,250');
    // Pre-existing defaults preserved
    expect(keyHandover.wallsCondition).toBe('Good');
  });

  it('all 25 expected fields are declared in initial state', () => {
    const { keyHandover } = makeStore().getState().document;
    const expectedFields = [
      'referenceNumber',
      'handoverDate',
      'tenantName',
      'landlordName',
      'propertyManagerName',
      'propertyManagerPhone',
      'propertyAddress',
      'gracePeriodStart',
      'gracePeriodEnd',
      'rentStartDate',
      'monthlyRent',
      'paymentType',
      'contractExpiryDate',
      'securityDeposit',
      'docDeadline',
      'wallsCondition',
      'wallsNotes',
      'flooringCondition',
      'flooringNotes',
      'acCondition',
      'acNotes',
      'fixturesCondition',
      'fixturesNotes',
      'cleaningStatus',
      'cleaningNotes',
    ];
    expectedFields.forEach((field) => {
      expect(keyHandover, `missing field: ${field}`).toHaveProperty(field);
    });
  });
});
