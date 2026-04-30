import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ToastHost from './ToastHost';
import { pushToast, restoreAuditLogs } from '../store/uiSlice';
import auditReducer, { addAuditLog } from '../store/auditSlice';
import { renderWithStore, buildTestStore } from '../test/renderWithStore';

// Note: the toast `action` descriptor uses `restoreAuditLogs.type` which lives
// in the audit slice; we re-export from uiSlice in the test by importing both.

describe('<ToastHost />', () => {
  it('renders nothing when there are no toasts', () => {
    renderWithStore(<ToastHost />);
    // Container should still render but be empty.
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('renders title + body and dismiss button for an info toast', () => {
    const store = buildTestStore();
    store.dispatch(pushToast({ title: 'Saved', body: 'All good', tone: 'info' }));
    renderWithStore(<ToastHost />, { store });

    expect(screen.getByText('Saved')).toBeInTheDocument();
    expect(screen.getByText('All good')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /dismiss/i })).toBeInTheDocument();
  });

  it('uses role="alert" for warning/error tones', () => {
    const store = buildTestStore();
    store.dispatch(pushToast({ title: 'Boom', tone: 'error' }));
    renderWithStore(<ToastHost />, { store });
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('clicking the action button dispatches the descriptor and dismisses the toast', async () => {
    const user = userEvent.setup();
    // Build a store that has BOTH ui and audit so the dispatched action lands somewhere meaningful.
    const store = buildTestStore({
      audit: { logs: [] },
      ui: { toasts: [] },
    });
    const snapshot = [{ type: 'PRINT', template: 'viewing', timestamp: '2026-04-23T10:00:00Z' }];
    store.dispatch(
      pushToast({
        title: 'Cleared',
        tone: 'warning',
        action: {
          label: 'Undo',
          type: 'audit/restoreAuditLogs',
          payload: snapshot,
        },
      }),
    );
    renderWithStore(<ToastHost />, { store });

    await user.click(screen.getByRole('button', { name: 'Undo' }));

    // Audit log should be restored from the snapshot.
    expect(store.getState().audit.logs).toEqual(snapshot);
    // Toast should be gone.
    expect(store.getState().ui.toasts).toEqual([]);
  });

  it('auto-dismisses after durationMs elapses', async () => {
    vi.useFakeTimers();
    try {
      const store = buildTestStore();
      store.dispatch(pushToast({ title: 'Quick', durationMs: 1000 }));
      renderWithStore(<ToastHost />, { store });

      expect(store.getState().ui.toasts).toHaveLength(1);

      act(() => {
        vi.advanceTimersByTime(1100);
      });

      expect(store.getState().ui.toasts).toEqual([]);
    } finally {
      vi.useRealTimers();
    }
  });

  it('toast with durationMs=0 is not auto-dismissed', async () => {
    vi.useFakeTimers();
    try {
      const store = buildTestStore();
      store.dispatch(pushToast({ title: 'Persistent', durationMs: 0 }));
      renderWithStore(<ToastHost />, { store });

      act(() => {
        vi.advanceTimersByTime(60000); // advance by 60 seconds
      });

      // Toast should still be present because durationMs=0 skips the timer.
      expect(store.getState().ui.toasts).toHaveLength(1);
    } finally {
      vi.useRealTimers();
    }
  });
});
