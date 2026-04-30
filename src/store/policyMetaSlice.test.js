import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import policyMetaReducer, { updatePolicyMeta } from './policyMetaSlice';

const makeStore = () => configureStore({ reducer: { policyMeta: policyMetaReducer } });

describe('policyMetaSlice — initial state', () => {
  it('seeds version, reviewedAt, reviewedBy and sources', () => {
    const { policyMeta } = makeStore().getState();
    expect(policyMeta.version).toMatch(/^v\d+/);
    expect(policyMeta.reviewedAt).toBeTruthy();
    expect(policyMeta.reviewedBy).toBeTruthy();
    expect(Array.isArray(policyMeta.sources)).toBe(true);
  });
});

describe('policyMetaSlice — updatePolicyMeta', () => {
  it('updates version when supplied', () => {
    const store = makeStore();
    store.dispatch(updatePolicyMeta({ version: 'v2.0.0' }));
    expect(store.getState().policyMeta.version).toBe('v2.0.0');
  });

  it('updates reviewedAt when supplied', () => {
    const store = makeStore();
    store.dispatch(updatePolicyMeta({ reviewedAt: '2027-01-01' }));
    expect(store.getState().policyMeta.reviewedAt).toBe('2027-01-01');
  });

  it('updates reviewedBy when supplied', () => {
    const store = makeStore();
    store.dispatch(updatePolicyMeta({ reviewedBy: 'Legal Team' }));
    expect(store.getState().policyMeta.reviewedBy).toBe('Legal Team');
  });

  it('updates all three fields at once', () => {
    const store = makeStore();
    store.dispatch(
      updatePolicyMeta({ version: 'v3.1.0', reviewedAt: '2027-06-15', reviewedBy: 'Compliance Dept' }),
    );
    const { policyMeta } = store.getState();
    expect(policyMeta.version).toBe('v3.1.0');
    expect(policyMeta.reviewedAt).toBe('2027-06-15');
    expect(policyMeta.reviewedBy).toBe('Compliance Dept');
  });

  it('preserves sources when updating meta fields', () => {
    const store = makeStore();
    const originalSources = store.getState().policyMeta.sources;
    store.dispatch(updatePolicyMeta({ version: 'v9.0.0' }));
    expect(store.getState().policyMeta.sources).toEqual(originalSources);
  });

  it('skips falsy fields (leaves current values intact)', () => {
    const store = makeStore();
    const { version, reviewedAt, reviewedBy } = store.getState().policyMeta;
    store.dispatch(updatePolicyMeta({ version: '', reviewedAt: null, reviewedBy: undefined }));
    // Falsy values should not overwrite existing state
    expect(store.getState().policyMeta.version).toBe(version);
    expect(store.getState().policyMeta.reviewedAt).toBe(reviewedAt);
    expect(store.getState().policyMeta.reviewedBy).toBe(reviewedBy);
  });

  it('does not modify state when payload has no recognised fields', () => {
    const store = makeStore();
    const before = store.getState().policyMeta;
    store.dispatch(updatePolicyMeta({}));
    expect(store.getState().policyMeta).toEqual(before);
  });
});
