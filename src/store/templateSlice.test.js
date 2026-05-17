/**
 * templateSlice.test.js
 * Unit tests for templateSlice reducers and initial state.
 */
import { describe, it, expect } from 'vitest';
import reducer, { setActiveTemplate } from './templateSlice';

const initialState = { activeTemplate: 'booking' };

// ── initial state ─────────────────────────────────────────────────────────────

describe('templateSlice — initial state', () => {
  it('returns initial state when called with undefined', () => {
    const state = reducer(undefined, { type: '@@INIT' });
    expect(state).toEqual(initialState);
  });

  it('default activeTemplate is "booking"', () => {
    const state = reducer(undefined, { type: '@@INIT' });
    expect(state.activeTemplate).toBe('booking');
  });
});

// ── setActiveTemplate ─────────────────────────────────────────────────────────

describe('templateSlice — setActiveTemplate', () => {
  it('updates activeTemplate to the given key', () => {
    const state = reducer(initialState, setActiveTemplate('viewing'));
    expect(state.activeTemplate).toBe('viewing');
  });

  it('updates to "tenancy"', () => {
    const state = reducer(initialState, setActiveTemplate('tenancy'));
    expect(state.activeTemplate).toBe('tenancy');
  });

  it('updates to "addendum"', () => {
    const state = reducer(initialState, setActiveTemplate('addendum'));
    expect(state.activeTemplate).toBe('addendum');
  });

  it('updates to "keyHandover"', () => {
    const state = reducer(initialState, setActiveTemplate('keyHandover'));
    expect(state.activeTemplate).toBe('keyHandover');
  });

  it('updates to "salaryCertificate"', () => {
    const state = reducer(initialState, setActiveTemplate('salaryCertificate'));
    expect(state.activeTemplate).toBe('salaryCertificate');
  });

  it('can switch between multiple template keys sequentially', () => {
    let state = reducer(initialState, setActiveTemplate('viewing'));
    expect(state.activeTemplate).toBe('viewing');
    state = reducer(state, setActiveTemplate('invoice'));
    expect(state.activeTemplate).toBe('invoice');
    state = reducer(state, setActiveTemplate('booking'));
    expect(state.activeTemplate).toBe('booking');
  });

  it('setting same key is a no-op (value stays the same)', () => {
    const state = reducer(initialState, setActiveTemplate('booking'));
    expect(state.activeTemplate).toBe('booking');
  });

  it('unknown action leaves state unchanged', () => {
    const state = reducer(initialState, { type: 'unknown/noop' });
    expect(state).toEqual(initialState);
  });

  it('action creator is exported with correct type', () => {
    const action = setActiveTemplate('viewing');
    expect(action.type).toBe('template/setActiveTemplate');
    expect(action.payload).toBe('viewing');
  });
});
