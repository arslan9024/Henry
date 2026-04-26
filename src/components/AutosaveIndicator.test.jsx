import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import uiReducer, { markDirty, markSaved } from '../store/uiSlice';
import AutosaveIndicator from './AutosaveIndicator';

const makeStore = () => configureStore({ reducer: { ui: uiReducer } });

const renderWithStore = (store) =>
  render(
    <Provider store={store}>
      <AutosaveIndicator />
    </Provider>,
  );

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-04-24T10:00:00Z'));
});
afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

describe('AutosaveIndicator (T-39)', () => {
  it('renders idle "Up to date" pill at boot', () => {
    renderWithStore(makeStore());
    const pill = screen.getByRole('status');
    expect(pill).toHaveAttribute('data-status', 'idle');
    expect(pill).toHaveAttribute('data-tone', 'neutral');
    expect(pill).toHaveTextContent('Up to date');
  });

  it('flips to "Saving…" on markDirty', () => {
    const store = makeStore();
    renderWithStore(store);
    act(() => {
      store.dispatch(markDirty(Date.now()));
    });
    const pill = screen.getByRole('status');
    expect(pill).toHaveAttribute('data-status', 'saving');
    expect(pill).toHaveAttribute('data-tone', 'warning');
    expect(pill).toHaveTextContent('Saving…');
  });

  it('flips to "Saved just now" on markSaved', () => {
    const store = makeStore();
    renderWithStore(store);
    act(() => {
      store.dispatch(markSaved(Date.now()));
    });
    const pill = screen.getByRole('status');
    expect(pill).toHaveAttribute('data-status', 'saved');
    expect(pill).toHaveAttribute('data-tone', 'success');
    expect(pill).toHaveTextContent(/Saved just now/);
  });

  it('relative timestamp ticks to seconds-ago after time passes', () => {
    const store = makeStore();
    const savedAt = Date.now();
    renderWithStore(store);
    act(() => {
      store.dispatch(markSaved(savedAt));
    });
    expect(screen.getByRole('status')).toHaveTextContent(/just now/);
    // Advance 30s — the interval ticks `now` and the label updates.
    act(() => {
      vi.advanceTimersByTime(30_000);
    });
    expect(screen.getByRole('status')).toHaveTextContent(/Saved 30s ago/);
  });
});
