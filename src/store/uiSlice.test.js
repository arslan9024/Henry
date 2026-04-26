import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import uiReducer, { pushToast, dismissToast, clearToasts, selectToasts } from './uiSlice';

const makeStore = () => configureStore({ reducer: { ui: uiReducer } });

describe('uiSlice — toast lifecycle', () => {
  let store;
  beforeEach(() => {
    store = makeStore();
  });

  it('starts with no toasts', () => {
    expect(selectToasts(store.getState())).toEqual([]);
  });

  it('pushToast adds an entry with defaults', () => {
    store.dispatch(pushToast({ title: 'Saved' }));
    const toasts = selectToasts(store.getState());
    expect(toasts).toHaveLength(1);
    expect(toasts[0]).toMatchObject({
      title: 'Saved',
      tone: 'info',
      durationMs: 5000,
      action: null,
    });
    expect(toasts[0].id).toBeTruthy();
  });

  it('preserves a valid action descriptor', () => {
    store.dispatch(
      pushToast({
        title: 'Cleared',
        tone: 'warning',
        action: { label: 'Undo', type: 'audit/restoreAuditLogs', payload: [{ a: 1 }] },
      }),
    );
    const t = selectToasts(store.getState())[0];
    expect(t.action).toEqual({
      label: 'Undo',
      type: 'audit/restoreAuditLogs',
      payload: [{ a: 1 }],
    });
  });

  it('drops malformed action descriptors (missing label or type)', () => {
    store.dispatch(pushToast({ title: 'x', action: { label: 'Undo' /* type missing */ } }));
    expect(selectToasts(store.getState())[0].action).toBeNull();
  });

  it('dismissToast removes the matching id', () => {
    store.dispatch(pushToast({ title: 'A' }));
    store.dispatch(pushToast({ title: 'B' }));
    const [a] = selectToasts(store.getState());
    store.dispatch(dismissToast(a.id));
    const remaining = selectToasts(store.getState());
    expect(remaining).toHaveLength(1);
    expect(remaining[0].title).toBe('B');
  });

  it('clearToasts empties the queue', () => {
    store.dispatch(pushToast({ title: 'A' }));
    store.dispatch(pushToast({ title: 'B' }));
    store.dispatch(clearToasts());
    expect(selectToasts(store.getState())).toEqual([]);
  });
});
