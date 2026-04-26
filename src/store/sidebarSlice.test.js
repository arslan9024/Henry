import { describe, it, expect } from 'vitest';
import reducer, { refreshSidebarTimestamp } from './sidebarSlice';

describe('sidebarSlice', () => {
  it('initial state carries guidance object + a baseline lastUpdated date', () => {
    const state = reducer(undefined, { type: '@@INIT' });
    expect(state.guidance).toBeTypeOf('object');
    expect(state.guidance).not.toBeNull();
    expect(state.lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('refreshSidebarTimestamp accepts an explicit date string', () => {
    const state = reducer(undefined, refreshSidebarTimestamp('2027-01-15'));
    expect(state.lastUpdated).toBe('2027-01-15');
  });

  it('refreshSidebarTimestamp without payload defaults to today (YYYY-MM-DD)', () => {
    const state = reducer(undefined, refreshSidebarTimestamp());
    // Must be a 10-char ISO date (covers the `|| new Date()...slice(0,10)` branch)
    expect(state.lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(state.lastUpdated).toBe(new Date().toISOString().slice(0, 10));
  });
});
