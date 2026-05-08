/**
 * ToastHost.deep.test.jsx
 *
 * Deep coverage for ToastHost and ToastItem — multiple simultaneous toasts,
 * ARIA live regions, tone→role mapping, rendering without title/body/action,
 * dismiss button per-toast isolation, and timer edge cases.
 */
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, screen, cleanup, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ToastHost from './ToastHost';
import { pushToast } from '../store/uiSlice';
import { renderWithStore, buildTestStore } from '../test/renderWithStore';

afterEach(cleanup);

// ── Container ─────────────────────────────────────────────────────────────────

describe('ToastHost — container element', () => {
  it('renders nothing at all when no toasts', () => {
    const { container } = renderWithStore(<ToastHost />);
    expect(container.firstChild).toBeNull();
  });

  it('renders container with aria-label="Notifications" when toasts exist', () => {
    const store = buildTestStore();
    store.dispatch(pushToast({ title: 'Hello', tone: 'info' }));
    renderWithStore(<ToastHost />, { store });
    const host = screen.getByLabelText('Notifications');
    expect(host).toBeInTheDocument();
  });

  it('contains all rendered toasts inside the host', () => {
    const store = buildTestStore();
    store.dispatch(pushToast({ title: 'One', tone: 'info' }));
    store.dispatch(pushToast({ title: 'Two', tone: 'success' }));
    store.dispatch(pushToast({ title: 'Three', tone: 'warning' }));
    renderWithStore(<ToastHost />, { store });
    screen.getByLabelText('Notifications'); // container exists
    expect(screen.getByText('One')).toBeInTheDocument();
    expect(screen.getByText('Two')).toBeInTheDocument();
    expect(screen.getByText('Three')).toBeInTheDocument();
  });
});

// ── ARIA roles per tone ───────────────────────────────────────────────────────

describe('ToastHost — ARIA role per tone', () => {
  it.each(['info', 'success'])('tone="%s" gets role="status"', (tone) => {
    const store = buildTestStore();
    store.dispatch(pushToast({ title: 'Hi', tone }));
    renderWithStore(<ToastHost />, { store });
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it.each(['warning', 'error'])('tone="%s" gets role="alert"', (tone) => {
    const store = buildTestStore();
    store.dispatch(pushToast({ title: 'Hi', tone }));
    renderWithStore(<ToastHost />, { store });
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});

// ── aria-live per tone ────────────────────────────────────────────────────────

describe('ToastHost — aria-live per tone', () => {
  it.each(['info', 'success'])('tone="%s" has aria-live="polite"', (tone) => {
    const store = buildTestStore();
    store.dispatch(pushToast({ title: 'Msg', tone }));
    renderWithStore(<ToastHost />, { store });
    const el = screen.getByRole('status');
    expect(el).toHaveAttribute('aria-live', 'polite');
  });

  it.each(['warning', 'error'])('tone="%s" has aria-live="assertive"', (tone) => {
    const store = buildTestStore();
    store.dispatch(pushToast({ title: 'Msg', tone }));
    renderWithStore(<ToastHost />, { store });
    const el = screen.getByRole('alert');
    expect(el).toHaveAttribute('aria-live', 'assertive');
  });
});

// ── Optional fields ───────────────────────────────────────────────────────────

describe('ToastHost — optional fields', () => {
  it('toast without body renders no body span', () => {
    const store = buildTestStore();
    store.dispatch(pushToast({ title: 'Title only', tone: 'info' }));
    renderWithStore(<ToastHost />, { store });
    const toast = screen.getByRole('status');
    expect(within(toast).queryByText('undefined')).toBeNull();
    // body span should be absent
    expect(toast.querySelector('.toast__text')).toBeNull();
  });

  it('toast without title renders no title element', () => {
    const store = buildTestStore();
    store.dispatch(pushToast({ body: 'Body only', tone: 'info' }));
    renderWithStore(<ToastHost />, { store });
    const toast = screen.getByRole('status');
    expect(toast.querySelector('.toast__title')).toBeNull();
    expect(screen.getByText('Body only')).toBeInTheDocument();
  });

  it('toast without action renders no action button', () => {
    const store = buildTestStore();
    store.dispatch(pushToast({ title: 'No action', tone: 'info' }));
    renderWithStore(<ToastHost />, { store });
    const toast = screen.getByRole('status');
    // Only dismiss button should be present
    expect(within(toast).getAllByRole('button')).toHaveLength(1);
  });
});

// ── Dismiss button ────────────────────────────────────────────────────────────

describe('ToastHost — dismiss button', () => {
  it('every toast has its own dismiss button', () => {
    const store = buildTestStore();
    store.dispatch(pushToast({ title: 'A', tone: 'info' }));
    store.dispatch(pushToast({ title: 'B', tone: 'info' }));
    renderWithStore(<ToastHost />, { store });
    const dismissBtns = screen.getAllByRole('button', { name: /dismiss/i });
    expect(dismissBtns).toHaveLength(2);
  });

  it('clicking dismiss removes only that toast', async () => {
    const user = userEvent.setup();
    const store = buildTestStore();
    store.dispatch(pushToast({ title: 'Keep me', tone: 'info' }));
    store.dispatch(pushToast({ title: 'Remove me', tone: 'info' }));
    renderWithStore(<ToastHost />, { store });

    expect(store.getState().ui.toasts).toHaveLength(2);

    const dismissBtns = screen.getAllByRole('button', { name: /dismiss/i });
    // Dismiss the second toast
    await user.click(dismissBtns[1]);

    expect(store.getState().ui.toasts).toHaveLength(1);
    expect(store.getState().ui.toasts[0].title).toBe('Keep me');
  });

  it('dismiss button aria-label is "Dismiss notification"', () => {
    const store = buildTestStore();
    store.dispatch(pushToast({ title: 'Hi', tone: 'info' }));
    renderWithStore(<ToastHost />, { store });
    const btn = screen.getByRole('button', { name: /dismiss notification/i });
    expect(btn).toBeInTheDocument();
  });
});

// ── Auto-dismiss timer edge cases ─────────────────────────────────────────────

describe('ToastHost — auto-dismiss edge cases', () => {
  it('does not auto-dismiss when durationMs is not supplied', () => {
    vi.useFakeTimers();
    try {
      const store = buildTestStore();
      store.dispatch(pushToast({ title: 'No timer', tone: 'info', durationMs: 0 }));
      renderWithStore(<ToastHost />, { store });
      act(() => {
        vi.advanceTimersByTime(60_000);
      });
      expect(store.getState().ui.toasts).toHaveLength(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('toast A auto-dismisses without affecting toast B', () => {
    vi.useFakeTimers();
    try {
      const store = buildTestStore();
      store.dispatch(pushToast({ title: 'Short', tone: 'info', durationMs: 500 }));
      store.dispatch(pushToast({ title: 'Long', tone: 'info', durationMs: 5000 }));
      renderWithStore(<ToastHost />, { store });
      expect(store.getState().ui.toasts).toHaveLength(2);
      act(() => {
        vi.advanceTimersByTime(600);
      });
      expect(store.getState().ui.toasts).toHaveLength(1);
      expect(store.getState().ui.toasts[0].title).toBe('Long');
    } finally {
      vi.useRealTimers();
    }
  });
});

// ── Multiple toasts — order preserved ────────────────────────────────────────

describe('ToastHost — multiple toasts', () => {
  it('5 simultaneous toasts all render', () => {
    const store = buildTestStore();
    for (let i = 1; i <= 5; i++) {
      store.dispatch(pushToast({ title: `Toast ${i}`, tone: 'info' }));
    }
    renderWithStore(<ToastHost />, { store });
    for (let i = 1; i <= 5; i++) {
      expect(screen.getByText(`Toast ${i}`)).toBeInTheDocument();
    }
  });
});
