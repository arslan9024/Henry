/**
 * uiSlice.deep.test.js
 *
 * Deeper coverage for uiSlice — fills the gaps left by uiSlice.test.js and
 * uiSlice.autosave.test.js:
 *   - Toast: tone variants, body field, durationMs override, unique IDs,
 *            dismissToast non-existent ID, clearToasts from empty queue,
 *            valid/invalid action descriptor edge cases
 *   - Save: resetSaveState from every starting state, markDirty/markSaved
 *           with no-argument fallbacks, extraReducers document/ trigger
 *   - Preview: full lifecycle idle→rendering→ready, idle→rendering→error,
 *              error recovery (re-render), setPreviewReady no-arg fallback,
 *              setPreviewError does not reset lastRenderedAt
 *   - Cross: document/ actions auto-trigger saving state
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import documentReducer, { setDocumentValue } from './documentSlice';
import uiReducer, {
  pushToast,
  dismissToast,
  clearToasts,
  markDirty,
  markSaved,
  resetSaveState,
  setPreviewRendering,
  setPreviewReady,
  setPreviewError,
  resetPreviewStatus,
  selectToasts,
  selectSaveState,
  selectPreviewState,
  selectIsPreviewReady,
} from './uiSlice';

const makeStore = () => configureStore({ reducer: { ui: uiReducer } });

// Store with document slice so extraReducers matcher fires
const makeFullStore = () => configureStore({ reducer: { ui: uiReducer, document: documentReducer } });

// ── Toast — tone variants ─────────────────────────────────────────────────────

describe('uiSlice — pushToast tone variants', () => {
  it.each(['info', 'success', 'warning', 'error'])('tone="%s" is stored correctly', (tone) => {
    const store = makeStore();
    store.dispatch(pushToast({ tone, title: `${tone} toast` }));
    expect(selectToasts(store.getState())[0].tone).toBe(tone);
  });

  it('omitting tone defaults to "info"', () => {
    const store = makeStore();
    store.dispatch(pushToast({ title: 'No tone' }));
    expect(selectToasts(store.getState())[0].tone).toBe('info');
  });
});

// ── Toast — body field ────────────────────────────────────────────────────────

describe('uiSlice — pushToast body field', () => {
  it('stores the body string when provided', () => {
    const store = makeStore();
    store.dispatch(pushToast({ title: 'T', body: 'Additional detail' }));
    expect(selectToasts(store.getState())[0].body).toBe('Additional detail');
  });

  it('defaults body to empty string when omitted', () => {
    const store = makeStore();
    store.dispatch(pushToast({ title: 'T' }));
    expect(selectToasts(store.getState())[0].body).toBe('');
  });
});

// ── Toast — durationMs override ───────────────────────────────────────────────

describe('uiSlice — pushToast durationMs', () => {
  it('defaults durationMs to 5000', () => {
    const store = makeStore();
    store.dispatch(pushToast({ title: 'T' }));
    expect(selectToasts(store.getState())[0].durationMs).toBe(5000);
  });

  it('respects a custom durationMs of 2000', () => {
    const store = makeStore();
    store.dispatch(pushToast({ title: 'T', durationMs: 2000 }));
    expect(selectToasts(store.getState())[0].durationMs).toBe(2000);
  });

  it('respects a custom durationMs of 10000', () => {
    const store = makeStore();
    store.dispatch(pushToast({ title: 'T', durationMs: 10000 }));
    expect(selectToasts(store.getState())[0].durationMs).toBe(10000);
  });
});

// ── Toast — unique IDs ────────────────────────────────────────────────────────

describe('uiSlice — pushToast generates unique IDs', () => {
  it('two toasts get different IDs', () => {
    const store = makeStore();
    store.dispatch(pushToast({ title: 'A' }));
    store.dispatch(pushToast({ title: 'B' }));
    const [a, b] = selectToasts(store.getState());
    expect(a.id).toBeTruthy();
    expect(b.id).toBeTruthy();
    expect(a.id).not.toBe(b.id);
  });

  it('ten toasts all have distinct IDs', () => {
    const store = makeStore();
    for (let i = 0; i < 10; i++) store.dispatch(pushToast({ title: `T${i}` }));
    const ids = selectToasts(store.getState()).map((t) => t.id);
    expect(new Set(ids).size).toBe(10);
  });
});

// ── Toast — dismissToast edge cases ───────────────────────────────────────────

describe('uiSlice — dismissToast edge cases', () => {
  it('dismissing a non-existent ID is a no-op (no crash, no state change)', () => {
    const store = makeStore();
    store.dispatch(pushToast({ title: 'A' }));
    const before = selectToasts(store.getState()).length;
    store.dispatch(dismissToast('does-not-exist'));
    expect(selectToasts(store.getState())).toHaveLength(before);
  });

  it('dismisses the middle toast correctly (leaving others intact)', () => {
    const store = makeStore();
    store.dispatch(pushToast({ title: 'First' }));
    store.dispatch(pushToast({ title: 'Middle' }));
    store.dispatch(pushToast({ title: 'Last' }));
    const toasts = selectToasts(store.getState());
    store.dispatch(dismissToast(toasts[1].id));
    const remaining = selectToasts(store.getState());
    expect(remaining).toHaveLength(2);
    expect(remaining.map((t) => t.title)).toEqual(['First', 'Middle', 'Last'].filter((_, i) => i !== 1));
  });

  it('can dismiss all toasts one-by-one until empty', () => {
    const store = makeStore();
    store.dispatch(pushToast({ title: 'A' }));
    store.dispatch(pushToast({ title: 'B' }));
    store.dispatch(pushToast({ title: 'C' }));
    let toasts = selectToasts(store.getState());
    while (toasts.length > 0) {
      store.dispatch(dismissToast(toasts[0].id));
      toasts = selectToasts(store.getState());
    }
    expect(selectToasts(store.getState())).toHaveLength(0);
  });
});

// ── Toast — clearToasts edge cases ────────────────────────────────────────────

describe('uiSlice — clearToasts edge cases', () => {
  it('clearToasts on an empty queue is a no-op (no crash)', () => {
    const store = makeStore();
    expect(() => store.dispatch(clearToasts())).not.toThrow();
    expect(selectToasts(store.getState())).toHaveLength(0);
  });

  it('clearToasts after adding 5 toasts empties the queue', () => {
    const store = makeStore();
    for (let i = 0; i < 5; i++) store.dispatch(pushToast({ title: `T${i}` }));
    store.dispatch(clearToasts());
    expect(selectToasts(store.getState())).toHaveLength(0);
  });
});

// ── Toast — action descriptor edge cases ─────────────────────────────────────

describe('uiSlice — pushToast action descriptor validation', () => {
  it('stores a valid { label, type, payload } descriptor', () => {
    const store = makeStore();
    store.dispatch(
      pushToast({
        title: 'Cleared',
        action: { label: 'Undo', type: 'audit/restoreAuditLogs', payload: [1, 2, 3] },
      }),
    );
    expect(selectToasts(store.getState())[0].action).toEqual({
      label: 'Undo',
      type: 'audit/restoreAuditLogs',
      payload: [1, 2, 3],
    });
  });

  it('stores action with null payload when payload is omitted', () => {
    const store = makeStore();
    store.dispatch(
      pushToast({
        title: 'Done',
        action: { label: 'Undo', type: 'audit/clear' },
      }),
    );
    expect(selectToasts(store.getState())[0].action.payload).toBeNull();
  });

  it('drops action when label is missing', () => {
    const store = makeStore();
    store.dispatch(pushToast({ title: 'x', action: { type: 'audit/clear' } }));
    expect(selectToasts(store.getState())[0].action).toBeNull();
  });

  it('drops action when type is missing', () => {
    const store = makeStore();
    store.dispatch(pushToast({ title: 'x', action: { label: 'Undo' } }));
    expect(selectToasts(store.getState())[0].action).toBeNull();
  });

  it('drops action when action is null', () => {
    const store = makeStore();
    store.dispatch(pushToast({ title: 'x', action: null }));
    expect(selectToasts(store.getState())[0].action).toBeNull();
  });
});

// ── Save state — resetSaveState ───────────────────────────────────────────────

describe('uiSlice — resetSaveState from every starting state', () => {
  it('resetSaveState from "idle" stays idle with cleared timestamps', () => {
    const store = makeStore();
    store.dispatch(resetSaveState());
    expect(selectSaveState(store.getState())).toEqual({
      status: 'idle',
      dirtyAt: null,
      lastSavedAt: null,
    });
  });

  it('resetSaveState from "saving" returns to idle', () => {
    const store = makeStore();
    store.dispatch(markDirty(1000));
    store.dispatch(resetSaveState());
    expect(selectSaveState(store.getState()).status).toBe('idle');
    expect(selectSaveState(store.getState()).dirtyAt).toBeNull();
  });

  it('resetSaveState from "saved" returns to idle and clears lastSavedAt', () => {
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

// ── Save state — markDirty/markSaved no-argument fallbacks ───────────────────

describe('uiSlice — markDirty / markSaved no-argument fallbacks', () => {
  it('markDirty() with no argument uses Date.now() (is a number)', () => {
    const store = makeStore();
    store.dispatch(markDirty());
    const { dirtyAt } = selectSaveState(store.getState());
    expect(typeof dirtyAt).toBe('number');
    expect(dirtyAt).toBeGreaterThan(0);
  });

  it('markSaved() with no argument uses Date.now() (is a number)', () => {
    const store = makeStore();
    store.dispatch(markDirty());
    store.dispatch(markSaved());
    const { lastSavedAt } = selectSaveState(store.getState());
    expect(typeof lastSavedAt).toBe('number');
    expect(lastSavedAt).toBeGreaterThan(0);
  });
});

// ── Preview pipeline — complete lifecycles ────────────────────────────────────

describe('uiSlice — preview pipeline: idle → rendering → ready', () => {
  it('setPreviewRendering transitions to "rendering"', () => {
    const store = makeStore();
    store.dispatch(setPreviewRendering());
    expect(selectPreviewState(store.getState()).status).toBe('rendering');
  });

  it('setPreviewReady transitions to "ready" and sets lastRenderedAt', () => {
    const store = makeStore();
    store.dispatch(setPreviewRendering());
    store.dispatch(setPreviewReady(1234567890));
    const preview = selectPreviewState(store.getState());
    expect(preview.status).toBe('ready');
    expect(preview.lastRenderedAt).toBe(1234567890);
  });

  it('selectIsPreviewReady is false while rendering', () => {
    const store = makeStore();
    store.dispatch(setPreviewRendering());
    expect(selectIsPreviewReady(store.getState())).toBe(false);
  });

  it('selectIsPreviewReady is true after ready', () => {
    const store = makeStore();
    store.dispatch(setPreviewReady(Date.now()));
    expect(selectIsPreviewReady(store.getState())).toBe(true);
  });
});

describe('uiSlice — preview pipeline: idle → rendering → error', () => {
  it('setPreviewError transitions to "error"', () => {
    const store = makeStore();
    store.dispatch(setPreviewRendering());
    store.dispatch(setPreviewError());
    expect(selectPreviewState(store.getState()).status).toBe('error');
  });

  it('selectIsPreviewReady is false after error', () => {
    const store = makeStore();
    store.dispatch(setPreviewRendering());
    store.dispatch(setPreviewError());
    expect(selectIsPreviewReady(store.getState())).toBe(false);
  });
});

describe('uiSlice — preview pipeline: re-render after error', () => {
  it('error then re-render reaches "ready"', () => {
    const store = makeStore();
    store.dispatch(setPreviewRendering());
    store.dispatch(setPreviewError());
    store.dispatch(setPreviewRendering()); // retry
    store.dispatch(setPreviewReady(9999));
    expect(selectPreviewState(store.getState()).status).toBe('ready');
    expect(selectIsPreviewReady(store.getState())).toBe(true);
  });
});

describe('uiSlice — resetPreviewStatus', () => {
  it('resetPreviewStatus from "ready" goes back to idle with null lastRenderedAt', () => {
    const store = makeStore();
    store.dispatch(setPreviewReady(1234567890));
    store.dispatch(resetPreviewStatus());
    expect(selectPreviewState(store.getState())).toEqual({
      status: 'idle',
      lastRenderedAt: null,
    });
  });

  it('resetPreviewStatus from "rendering" goes back to idle', () => {
    const store = makeStore();
    store.dispatch(setPreviewRendering());
    store.dispatch(resetPreviewStatus());
    expect(selectPreviewState(store.getState()).status).toBe('idle');
  });

  it('resetPreviewStatus from "error" goes back to idle', () => {
    const store = makeStore();
    store.dispatch(setPreviewError());
    store.dispatch(resetPreviewStatus());
    expect(selectPreviewState(store.getState()).status).toBe('idle');
  });

  it('selectIsPreviewReady is false after resetPreviewStatus', () => {
    const store = makeStore();
    store.dispatch(setPreviewReady(Date.now()));
    store.dispatch(resetPreviewStatus());
    expect(selectIsPreviewReady(store.getState())).toBe(false);
  });
});

describe('uiSlice — setPreviewReady no-argument fallback', () => {
  it('setPreviewReady() with no arg stores a number', () => {
    const store = makeStore();
    store.dispatch(setPreviewReady());
    const { lastRenderedAt } = selectPreviewState(store.getState());
    expect(typeof lastRenderedAt).toBe('number');
    expect(lastRenderedAt).toBeGreaterThan(0);
  });
});

// ── extraReducers — document/ actions trigger "saving" ───────────────────────

describe('uiSlice — extraReducers: document/* actions auto-mark dirty', () => {
  it('dispatching setDocumentValue transitions save status to "saving"', () => {
    const store = makeFullStore();
    expect(selectSaveState(store.getState()).status).toBe('idle');
    store.dispatch(setDocumentValue({ section: 'tenant', field: 'fullName', value: 'Test' }));
    expect(selectSaveState(store.getState()).status).toBe('saving');
  });

  it('dispatching setDocumentValue sets dirtyAt to a number', () => {
    const store = makeFullStore();
    store.dispatch(setDocumentValue({ section: 'tenant', field: 'fullName', value: 'Test' }));
    expect(typeof selectSaveState(store.getState()).dirtyAt).toBe('number');
  });

  it('multiple document/ dispatches keep status as "saving"', () => {
    const store = makeFullStore();
    store.dispatch(setDocumentValue({ section: 'tenant', field: 'fullName', value: 'A' }));
    store.dispatch(setDocumentValue({ section: 'tenant', field: 'emiratesId', value: '784-1' }));
    expect(selectSaveState(store.getState()).status).toBe('saving');
  });
});
