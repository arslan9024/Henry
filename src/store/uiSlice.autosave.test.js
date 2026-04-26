import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import reducer, { markDirty, markSaved, resetSaveState, selectSaveState } from '../store/uiSlice';

const makeStore = () => configureStore({ reducer: { ui: reducer } });

describe('uiSlice — autosave (T-39)', () => {
  it('starts in idle with null timestamps', () => {
    const store = makeStore();
    expect(selectSaveState(store.getState())).toEqual({
      status: 'idle',
      dirtyAt: null,
      lastSavedAt: null,
    });
  });

  it('markDirty flips to saving and sets dirtyAt', () => {
    const store = makeStore();
    store.dispatch(markDirty(1000));
    const s = selectSaveState(store.getState());
    expect(s.status).toBe('saving');
    expect(s.dirtyAt).toBe(1000);
    expect(s.lastSavedAt).toBeNull();
  });

  it('markSaved flips to saved, clears dirtyAt, sets lastSavedAt', () => {
    const store = makeStore();
    store.dispatch(markDirty(1000));
    store.dispatch(markSaved(2000));
    expect(selectSaveState(store.getState())).toEqual({
      status: 'saved',
      dirtyAt: null,
      lastSavedAt: 2000,
    });
  });

  it('any document/* action auto-flags dirty via the matcher', () => {
    const store = makeStore();
    store.dispatch({ type: 'document/setDocumentValue', payload: { x: 1 } });
    const s = selectSaveState(store.getState());
    expect(s.status).toBe('saving');
    expect(s.dirtyAt).toEqual(expect.any(Number));
  });

  it('non-document actions do not mark dirty', () => {
    const store = makeStore();
    store.dispatch({ type: 'someOther/event' });
    expect(selectSaveState(store.getState()).status).toBe('idle');
  });

  it('resetSaveState returns to clean idle', () => {
    const store = makeStore();
    store.dispatch(markDirty(1000));
    store.dispatch(markSaved(2000));
    store.dispatch(resetSaveState());
    expect(selectSaveState(store.getState())).toEqual({
      status: 'idle',
      dirtyAt: null,
      lastSavedAt: null,
    });
  });
});
