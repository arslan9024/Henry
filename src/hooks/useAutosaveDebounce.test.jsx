import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import uiReducer, { markDirty, selectSaveState } from '../store/uiSlice';
import useAutosaveDebounce from './useAutosaveDebounce';

const makeStore = () => configureStore({ reducer: { ui: uiReducer } });

const Harness = ({ delayMs }) => {
  useAutosaveDebounce(delayMs);
  return null;
};

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

describe('useAutosaveDebounce (T-39)', () => {
  it('flushes saving → saved after the delay window', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <Harness delayMs={500} />
      </Provider>,
    );
    act(() => {
      store.dispatch(markDirty(1000));
    });
    expect(selectSaveState(store.getState()).status).toBe('saving');
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(selectSaveState(store.getState()).status).toBe('saved');
    expect(selectSaveState(store.getState()).lastSavedAt).toEqual(expect.any(Number));
    expect(selectSaveState(store.getState()).dirtyAt).toBeNull();
  });

  it('keystrokes inside the window restart the timer (debounce semantics)', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <Harness delayMs={500} />
      </Provider>,
    );
    act(() => {
      store.dispatch(markDirty(1000));
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    // Still saving — second keystroke retriggers.
    act(() => {
      store.dispatch(markDirty(2000));
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    // Only 300ms since the last dirty event — must NOT have flushed.
    expect(selectSaveState(store.getState()).status).toBe('saving');
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(selectSaveState(store.getState()).status).toBe('saved');
  });
});
