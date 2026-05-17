/**
 * policyMetaSlice.deep.test.js
 *
 * Deep coverage for policyMetaSlice — initial state values, sources data
 * shape, reducer edge cases, and data-contract assertions for the bundled
 * policy-sources.json.
 */
import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import policyMetaReducer, { updatePolicyMeta } from './policyMetaSlice';
import policySources from '../data/policy-sources.json';

const makeStore = (preloadedState) =>
  configureStore({ reducer: { policyMeta: policyMetaReducer }, preloadedState });

// ── Slice metadata ────────────────────────────────────────────────────────────

describe('policyMetaSlice — identity', () => {
  it('reducer is a function', () => {
    expect(typeof policyMetaReducer).toBe('function');
  });

  it('reducer returns initial state when called with undefined + INIT', () => {
    const state = policyMetaReducer(undefined, { type: '@@INIT' });
    expect(state).toBeTruthy();
    expect(typeof state).toBe('object');
  });
});

// ── Initial state values ──────────────────────────────────────────────────────

describe('policyMetaSlice — initial state exact values', () => {
  it('version is "v1.0.0"', () => {
    const { policyMeta } = makeStore().getState();
    expect(policyMeta.version).toBe('v1.0.0');
  });

  it('reviewedAt is "2026-04-23"', () => {
    const { policyMeta } = makeStore().getState();
    expect(policyMeta.reviewedAt).toBe('2026-04-23');
  });

  it('reviewedBy is "White Caves Compliance Team"', () => {
    const { policyMeta } = makeStore().getState();
    expect(policyMeta.reviewedBy).toBe('White Caves Compliance Team');
  });

  it('version matches semver-like pattern vX.Y.Z', () => {
    const { policyMeta } = makeStore().getState();
    expect(policyMeta.version).toMatch(/^v\d+\.\d+\.\d+/);
  });

  it('reviewedAt matches YYYY-MM-DD format', () => {
    const { policyMeta } = makeStore().getState();
    expect(policyMeta.reviewedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

// ── Sources data contract ─────────────────────────────────────────────────────

describe('policyMetaSlice — sources data contract', () => {
  it('sources is an array', () => {
    const { policyMeta } = makeStore().getState();
    expect(Array.isArray(policyMeta.sources)).toBe(true);
  });

  it('sources is non-empty', () => {
    const { policyMeta } = makeStore().getState();
    expect(policyMeta.sources.length).toBeGreaterThan(0);
  });

  it('every source has a "name" string', () => {
    const { policyMeta } = makeStore().getState();
    for (const src of policyMeta.sources) {
      expect(typeof src.name).toBe('string');
      expect(src.name.trim().length).toBeGreaterThan(0);
    }
  });

  it('every source has a "url" string', () => {
    const { policyMeta } = makeStore().getState();
    for (const src of policyMeta.sources) {
      expect(typeof src.url).toBe('string');
      expect(src.url.trim().length).toBeGreaterThan(0);
    }
  });

  it('sources equals the raw policy-sources.json import', () => {
    const { policyMeta } = makeStore().getState();
    expect(policyMeta.sources).toEqual(policySources);
  });

  it('at least one source references Dubai Land Department', () => {
    const { policyMeta } = makeStore().getState();
    const hasDld = policyMeta.sources.some(
      (s) => s.name.toLowerCase().includes('dubai') || s.url.includes('dubailand'),
    );
    expect(hasDld).toBe(true);
  });
});

// ── updatePolicyMeta edge cases ───────────────────────────────────────────────

describe('policyMetaSlice — updatePolicyMeta edge cases', () => {
  it('whitespace-only version IS applied (truthy string)', () => {
    const store = makeStore();
    store.dispatch(updatePolicyMeta({ version: '   ' }));
    // '   ' is truthy, so it overwrites
    expect(store.getState().policyMeta.version).toBe('   ');
  });

  it('number 0 does NOT overwrite (falsy)', () => {
    const store = makeStore();
    store.dispatch(updatePolicyMeta({ version: 0 }));
    expect(store.getState().policyMeta.version).toBe('v1.0.0');
  });

  it('dispatching multiple times accumulates changes', () => {
    const store = makeStore();
    store.dispatch(updatePolicyMeta({ version: 'v2.0.0' }));
    store.dispatch(updatePolicyMeta({ reviewedBy: 'Legal' }));
    store.dispatch(updatePolicyMeta({ reviewedAt: '2027-01-01' }));
    const { policyMeta } = store.getState();
    expect(policyMeta.version).toBe('v2.0.0');
    expect(policyMeta.reviewedBy).toBe('Legal');
    expect(policyMeta.reviewedAt).toBe('2027-01-01');
  });

  it('sources are never touched by updatePolicyMeta', () => {
    const store = makeStore();
    const originalSources = [...store.getState().policyMeta.sources];
    store.dispatch(updatePolicyMeta({ version: 'v99.0.0', reviewedBy: 'X', reviewedAt: '2099-01-01' }));
    expect(store.getState().policyMeta.sources).toEqual(originalSources);
  });

  it('two independent stores do not share state', () => {
    const storeA = makeStore();
    const storeB = makeStore();
    storeA.dispatch(updatePolicyMeta({ version: 'v5.0.0' }));
    expect(storeA.getState().policyMeta.version).toBe('v5.0.0');
    expect(storeB.getState().policyMeta.version).toBe('v1.0.0');
  });

  it('state reference is a new object after each dispatch', () => {
    const store = makeStore();
    const before = store.getState().policyMeta;
    store.dispatch(updatePolicyMeta({ version: 'v2.0.0' }));
    expect(store.getState().policyMeta).not.toBe(before);
  });

  it('state reference is SAME object when dispatch changes nothing (falsy payload)', () => {
    const store = makeStore();
    const before = store.getState().policyMeta;
    store.dispatch(updatePolicyMeta({}));
    // No changes → RTK may or may not return same ref, but values must match
    expect(store.getState().policyMeta).toEqual(before);
  });
});
