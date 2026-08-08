import { describe, expect, it } from 'vitest';
import reducer, { clearFieldSources, recordFieldSources } from './fieldSourceSlice';

describe('fieldSourceSlice', () => {
  it('attributes every non-empty applied field to its source', () => {
    const state = reducer(
      { byField: {} },
      recordFieldSources({
        section: 'tenant',
        values: { fullName: 'Tenant', passportNo: '', nationality: 'UAE' },
        source: { sourceId: 'passport-1', sourceType: 'passport', fileName: 'passport.pdf' },
      }),
    );
    expect(state.byField['tenant.fullName']).toEqual(
      expect.objectContaining({
        sourceId: 'passport-1',
        sourceType: 'passport',
        appliedAt: expect.any(String),
      }),
    );
    expect(state.byField['tenant.nationality']).toBeTruthy();
    expect(state.byField['tenant.passportNo']).toBeUndefined();
  });

  it('clears provenance independently from document values', () => {
    expect(clearFieldSources().type).toBe('fieldSources/clearFieldSources');
    expect(reducer({ byField: { 'tenant.fullName': { sourceId: '1' } } }, clearFieldSources())).toEqual({
      byField: {},
    });
  });
});
