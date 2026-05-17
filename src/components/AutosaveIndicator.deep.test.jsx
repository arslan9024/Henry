/**
 * AutosaveIndicator.deep.test.jsx
 *
 * Exhaustive coverage for the AutosaveIndicator component and its embedded
 * `formatAgo` time-formatting logic, tested indirectly through renders.
 */
import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import uiReducer, { markDirty, markSaved, resetSaveState } from '../store/uiSlice';
import AutosaveIndicator from './AutosaveIndicator';

const makeStore = (preloadedState) =>
  configureStore({
    reducer: { ui: uiReducer },
    preloadedState,
  });

const renderWith = (store) =>
  render(
    <Provider store={store}>
      <AutosaveIndicator />
    </Provider>,
  );

const BASE_TIME = new Date('2026-04-24T10:00:00Z').getTime();

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(BASE_TIME);
});

afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

// ── ARIA / accessibility structure ────────────────────────────────────────────

describe('AutosaveIndicator — ARIA structure', () => {
  it('has role="status" at all states', () => {
    const store = makeStore();
    renderWith(store);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has aria-live="polite" always', () => {
    const store = makeStore();
    renderWith(store);
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  });

  it('title says "No edits saved yet" before any save', () => {
    const store = makeStore();
    renderWith(store);
    const pill = screen.getByRole('status');
    expect(pill).toHaveAttribute('title', 'No edits saved yet');
  });

  it('title includes "Last saved at" after markSaved', () => {
    const store = makeStore();
    renderWith(store);
    act(() => {
      store.dispatch(markSaved(BASE_TIME));
    });
    const pill = screen.getByRole('status');
    expect(pill.getAttribute('title')).toMatch(/Last saved at/);
  });
});

// ── data-status / data-tone mapping ──────────────────────────────────────────

describe('AutosaveIndicator — status transitions', () => {
  it('idle → data-status="idle", data-tone="neutral"', () => {
    const store = makeStore();
    renderWith(store);
    const pill = screen.getByRole('status');
    expect(pill).toHaveAttribute('data-status', 'idle');
    expect(pill).toHaveAttribute('data-tone', 'neutral');
  });

  it('saving → data-status="saving", data-tone="warning"', () => {
    const store = makeStore();
    renderWith(store);
    act(() => {
      store.dispatch(markDirty(BASE_TIME));
    });
    const pill = screen.getByRole('status');
    expect(pill).toHaveAttribute('data-status', 'saving');
    expect(pill).toHaveAttribute('data-tone', 'warning');
  });

  it('saved → data-status="saved", data-tone="success"', () => {
    const store = makeStore();
    renderWith(store);
    act(() => {
      store.dispatch(markSaved(BASE_TIME));
    });
    const pill = screen.getByRole('status');
    expect(pill).toHaveAttribute('data-status', 'saved');
    expect(pill).toHaveAttribute('data-tone', 'success');
  });

  it('resetSaveState after saved returns to idle', () => {
    const store = makeStore();
    renderWith(store);
    act(() => {
      store.dispatch(markSaved(BASE_TIME));
      store.dispatch(resetSaveState());
    });
    const pill = screen.getByRole('status');
    expect(pill).toHaveAttribute('data-status', 'idle');
  });

  it('full cycle: idle → saving → saved → idle', () => {
    const store = makeStore();
    renderWith(store);
    act(() => {
      store.dispatch(markDirty(BASE_TIME));
    });
    expect(screen.getByRole('status')).toHaveAttribute('data-status', 'saving');
    act(() => {
      store.dispatch(markSaved(BASE_TIME));
    });
    expect(screen.getByRole('status')).toHaveAttribute('data-status', 'saved');
    act(() => {
      store.dispatch(resetSaveState());
    });
    expect(screen.getByRole('status')).toHaveAttribute('data-status', 'idle');
  });
});

// ── label text ────────────────────────────────────────────────────────────────

describe('AutosaveIndicator — label text', () => {
  it('idle shows "Up to date"', () => {
    const store = makeStore();
    renderWith(store);
    expect(screen.getByRole('status')).toHaveTextContent('Up to date');
  });

  it('saving shows "Saving…"', () => {
    const store = makeStore();
    renderWith(store);
    act(() => {
      store.dispatch(markDirty(BASE_TIME));
    });
    expect(screen.getByRole('status')).toHaveTextContent(/Saving/);
  });

  it('saved within 4s shows "Saved just now"', () => {
    const store = makeStore();
    renderWith(store);
    act(() => {
      store.dispatch(markSaved(BASE_TIME - 2000));
    }); // 2s ago
    expect(screen.getByRole('status')).toHaveTextContent(/Saved just now/);
  });

  it('saved 5s ago shows "Saved 5s ago"', () => {
    const store = makeStore();
    renderWith(store);
    act(() => {
      store.dispatch(markSaved(BASE_TIME - 5000));
    });
    expect(screen.getByRole('status')).toHaveTextContent(/Saved 5s ago/);
  });

  it('saved 30s ago shows "Saved 30s ago"', () => {
    const store = makeStore();
    renderWith(store);
    act(() => {
      store.dispatch(markSaved(BASE_TIME - 30_000));
    });
    expect(screen.getByRole('status')).toHaveTextContent(/Saved 30s ago/);
  });

  it('saved 59s ago shows "Saved 59s ago"', () => {
    const store = makeStore();
    renderWith(store);
    act(() => {
      store.dispatch(markSaved(BASE_TIME - 59_000));
    });
    expect(screen.getByRole('status')).toHaveTextContent(/Saved 59s ago/);
  });

  it('saved 60s ago shows "Saved 1m ago"', () => {
    const store = makeStore();
    renderWith(store);
    act(() => {
      store.dispatch(markSaved(BASE_TIME - 60_000));
    });
    expect(screen.getByRole('status')).toHaveTextContent(/Saved 1m ago/);
  });

  it('saved 59min ago shows "Saved 59m ago"', () => {
    const store = makeStore();
    renderWith(store);
    act(() => {
      store.dispatch(markSaved(BASE_TIME - 59 * 60_000));
    });
    expect(screen.getByRole('status')).toHaveTextContent(/Saved 59m ago/);
  });

  it('saved ≥1hr ago shows "Saved at HH:MM"', () => {
    const store = makeStore();
    renderWith(store);
    // BASE_TIME is 10:00:00 UTC; 2 hrs before = 08:00:00
    act(() => {
      store.dispatch(markSaved(BASE_TIME - 2 * 60 * 60_000));
    });
    expect(screen.getByRole('status')).toHaveTextContent(/Saved at \d{2}:\d{2}/);
  });
});

// ── ticking timer ─────────────────────────────────────────────────────────────

describe('AutosaveIndicator — 30s tick', () => {
  it('label updates after 30s passes', () => {
    const store = makeStore();
    renderWith(store);
    act(() => {
      store.dispatch(markSaved(BASE_TIME));
    });
    expect(screen.getByRole('status')).toHaveTextContent(/just now/);

    act(() => {
      vi.advanceTimersByTime(30_000);
    });
    expect(screen.getByRole('status')).toHaveTextContent(/30s ago/);
  });

  it('tick interval clears when state resets to idle', () => {
    const store = makeStore();
    renderWith(store);
    act(() => {
      store.dispatch(markSaved(BASE_TIME));
    });
    act(() => {
      store.dispatch(resetSaveState());
    });
    // Advance 60s — no timer error should occur
    expect(() => {
      act(() => {
        vi.advanceTimersByTime(60_000);
      });
    }).not.toThrow();
    // Pill still shows idle
    expect(screen.getByRole('status')).toHaveAttribute('data-status', 'idle');
  });

  it('tick does not fire while saving (status != saved)', () => {
    const store = makeStore();
    renderWith(store);
    act(() => {
      store.dispatch(markDirty(BASE_TIME));
    });
    // Advance 30s while saving — no crash, label unchanged
    expect(() => {
      act(() => {
        vi.advanceTimersByTime(30_000);
      });
    }).not.toThrow();
    expect(screen.getByRole('status')).toHaveAttribute('data-status', 'saving');
  });
});

// ── icon element ──────────────────────────────────────────────────────────────

describe('AutosaveIndicator — icon element', () => {
  it('renders an icon span with aria-hidden="true"', () => {
    const store = makeStore();
    renderWith(store);
    // The component has a span.autosave-pill__icon[aria-hidden="true"]
    const container = screen.getByRole('status');
    const icon = container.querySelector('[aria-hidden="true"]');
    expect(icon).not.toBeNull();
  });

  it('data-spin="false" when idle (not spinning)', () => {
    const store = makeStore();
    renderWith(store);
    const container = screen.getByRole('status');
    const icon = container.querySelector('[aria-hidden="true"]');
    expect(icon).toHaveAttribute('data-spin', 'false');
  });

  it('data-spin="true" when saving', () => {
    const store = makeStore();
    renderWith(store);
    act(() => {
      store.dispatch(markDirty(BASE_TIME));
    });
    const container = screen.getByRole('status');
    const icon = container.querySelector('[aria-hidden="true"]');
    expect(icon).toHaveAttribute('data-spin', 'true');
  });

  it('data-spin="false" after markSaved', () => {
    const store = makeStore();
    renderWith(store);
    act(() => {
      store.dispatch(markSaved(BASE_TIME));
    });
    const container = screen.getByRole('status');
    const icon = container.querySelector('[aria-hidden="true"]');
    expect(icon).toHaveAttribute('data-spin', 'false');
  });
});
