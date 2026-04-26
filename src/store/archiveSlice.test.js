import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the archive service BEFORE importing the slice — the slice calls
// loadArchiveEntries() at module load to seed initialState.
vi.mock('../records/archiveService', () => ({
  loadArchiveEntries: vi.fn(() => []),
  persistArchiveEntries: vi.fn(),
}));

import reducer, { addArchiveEntry, clearArchiveEntries } from './archiveSlice';
import { persistArchiveEntries } from '../records/archiveService';

describe('archiveSlice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts with an empty entries array (from mocked loader)', () => {
    const state = reducer(undefined, { type: '@@INIT' });
    expect(state.entries).toEqual([]);
  });

  it('addArchiveEntry unshifts (newest first) and persists', () => {
    let state = reducer(undefined, { type: '@@INIT' });
    state = reducer(state, addArchiveEntry({ id: 'a', unit: 'A-101' }));
    state = reducer(state, addArchiveEntry({ id: 'b', unit: 'B-202' }));
    expect(state.entries.map((e) => e.id)).toEqual(['b', 'a']);
    expect(persistArchiveEntries).toHaveBeenCalledTimes(2);
    expect(persistArchiveEntries).toHaveBeenLastCalledWith(state.entries);
  });

  it('caps entries at 100 (drops oldest)', () => {
    let state = { entries: [] };
    for (let i = 0; i < 105; i += 1) {
      state = reducer(state, addArchiveEntry({ id: `e${i}` }));
    }
    expect(state.entries.length).toBe(100);
    // Newest at top
    expect(state.entries[0].id).toBe('e104');
    // Oldest 5 dropped
    expect(state.entries.find((e) => e.id === 'e0')).toBeUndefined();
    expect(state.entries.find((e) => e.id === 'e4')).toBeUndefined();
    expect(state.entries[state.entries.length - 1].id).toBe('e5');
  });

  it('clearArchiveEntries empties the list and persists the empty array', () => {
    let state = reducer(undefined, { type: '@@INIT' });
    state = reducer(state, addArchiveEntry({ id: 'x' }));
    state = reducer(state, clearArchiveEntries());
    expect(state.entries).toEqual([]);
    expect(persistArchiveEntries).toHaveBeenLastCalledWith([]);
  });
});
