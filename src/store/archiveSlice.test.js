import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';

// Mock the archive service BEFORE importing the slice — the slice calls
// loadArchiveEntries() at module load to seed initialState.
vi.mock('../records/archiveService', () => ({
  loadArchiveEntries: vi.fn(() => []),
  persistArchiveEntries: vi.fn(),
}));

import reducer, { addArchiveEntry, clearArchiveEntries } from './archiveSlice';
import { persistArchiveEntries } from '../records/archiveService';

/** Store that includes listener middleware for persistence — mirrors the real store. */
const makeStoreWithPersistence = () => {
  const lm = createListenerMiddleware();
  lm.startListening({
    actionCreator: addArchiveEntry,
    effect: (_, api) => persistArchiveEntries(api.getState().archive.entries),
  });
  lm.startListening({
    actionCreator: clearArchiveEntries,
    effect: (_, api) => persistArchiveEntries(api.getState().archive.entries),
  });
  return configureStore({ reducer: { archive: reducer }, middleware: (gd) => gd().prepend(lm.middleware) });
};

describe('archiveSlice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts with an empty entries array (from mocked loader)', () => {
    const state = reducer(undefined, { type: '@@INIT' });
    expect(state.entries).toEqual([]);
  });

  it('addArchiveEntry unshifts (newest first) and persists', () => {
    const store = makeStoreWithPersistence();
    store.dispatch(addArchiveEntry({ id: 'a', unit: 'A-101' }));
    store.dispatch(addArchiveEntry({ id: 'b', unit: 'B-202' }));
    const entries = store.getState().archive.entries;
    expect(entries.map((e) => e.id)).toEqual(['b', 'a']);
    expect(persistArchiveEntries).toHaveBeenCalledTimes(2);
    expect(persistArchiveEntries).toHaveBeenLastCalledWith(entries);
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
    const store = makeStoreWithPersistence();
    store.dispatch(addArchiveEntry({ id: 'x' }));
    store.dispatch(clearArchiveEntries());
    expect(store.getState().archive.entries).toEqual([]);
    expect(persistArchiveEntries).toHaveBeenLastCalledWith([]);
  });
});
