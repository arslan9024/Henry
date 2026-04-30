import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import reducer, {
  pushToast,
  markDirty,
  markSaved,
  resetSaveState,
  selectSaveState,
  setPreviewReady,
  setPreviewRendering,
  setPreviewError,
  resetPreviewStatus,
} from '../store/uiSlice';

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

describe('uiSlice — preview status actions', () => {
  it('starts with preview idle', () => {
    const store = makeStore();
    expect(store.getState().ui.preview.status).toBe('idle');
    expect(store.getState().ui.preview.lastRenderedAt).toBeNull();
  });

  it('setPreviewRendering sets status to rendering', () => {
    const store = makeStore();
    store.dispatch(setPreviewRendering());
    expect(store.getState().ui.preview.status).toBe('rendering');
  });

  it('setPreviewReady sets status to ready and records timestamp', () => {
    const store = makeStore();
    store.dispatch(setPreviewReady(9999));
    expect(store.getState().ui.preview.status).toBe('ready');
    expect(store.getState().ui.preview.lastRenderedAt).toBe(9999);
  });

  it('setPreviewReady defaults to current time when no timestamp given', () => {
    const store = makeStore();
    const before = Date.now();
    store.dispatch(setPreviewReady());
    const after = Date.now();
    const ts = store.getState().ui.preview.lastRenderedAt;
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);
  });

  it('setPreviewError sets status to error', () => {
    const store = makeStore();
    store.dispatch(setPreviewRendering());
    store.dispatch(setPreviewError());
    expect(store.getState().ui.preview.status).toBe('error');
  });

  it('resetPreviewStatus returns to idle', () => {
    const store = makeStore();
    store.dispatch(setPreviewReady(1234));
    store.dispatch(resetPreviewStatus());
    expect(store.getState().ui.preview.status).toBe('idle');
    expect(store.getState().ui.preview.lastRenderedAt).toBeNull();
  });
});

describe('uiSlice — document/* matcher preview branch', () => {
  it('transitions preview from ready → rendering on any document action', () => {
    const store = makeStore();
    // First put preview in ready state.
    store.dispatch(setPreviewReady(5000));
    expect(store.getState().ui.preview.status).toBe('ready');
    // Any document action should flip it to rendering.
    store.dispatch({ type: 'document/setDocumentValue', payload: {} });
    expect(store.getState().ui.preview.status).toBe('rendering');
  });

  it('does NOT change preview when it is already rendering (idempotent)', () => {
    const store = makeStore();
    store.dispatch(setPreviewRendering());
    store.dispatch({ type: 'document/updateDocumentSection', payload: {} });
    // Still rendering — guard prevents double-transition.
    expect(store.getState().ui.preview.status).toBe('rendering');
  });

  it('does NOT change preview when it is idle (only flips from ready)', () => {
    const store = makeStore();
    // preview starts idle; document action should leave it idle.
    store.dispatch({ type: 'document/setDocumentValue', payload: {} });
    expect(store.getState().ui.preview.status).toBe('idle');
  });

  it('does NOT change preview when it is in error state', () => {
    const store = makeStore();
    store.dispatch(setPreviewError());
    store.dispatch({ type: 'document/setDocumentValue', payload: {} });
    expect(store.getState().ui.preview.status).toBe('error');
  });
});

// ─── pushToast prepare branches ─────────────────────────────────────────────
describe('uiSlice — pushToast prepare branch coverage', () => {
  it('title defaults to empty string when omitted', () => {
    const store = makeStore();
    store.dispatch(pushToast({ tone: 'info', body: 'No title here' }));
    const toast = store.getState().ui.toasts[0];
    expect(toast.title).toBe('');
  });

  it('body defaults to empty string when omitted', () => {
    const store = makeStore();
    store.dispatch(pushToast({ tone: 'success', title: 'Done' }));
    const toast = store.getState().ui.toasts[0];
    expect(toast.body).toBe('');
  });

  it('action descriptor without payload sets payload to null', () => {
    const store = makeStore();
    store.dispatch(
      pushToast({
        title: 'Undo available',
        action: { label: 'Undo', type: 'some/action' },
      }),
    );
    const toast = store.getState().ui.toasts[0];
    expect(toast.action).toEqual({ label: 'Undo', type: 'some/action', payload: null });
  });

  it('missing label or type in action results in null action', () => {
    const store = makeStore();
    store.dispatch(pushToast({ title: 'X', action: { label: 'Y' } })); // no type
    expect(store.getState().ui.toasts[0].action).toBeNull();
  });

  it('no action arg produces null action field', () => {
    const store = makeStore();
    store.dispatch(pushToast({ title: 'plain' }));
    expect(store.getState().ui.toasts[0].action).toBeNull();
  });
});

// ─── markDirty / markSaved prepare fallback paths ────────────────────────────
describe('uiSlice — markDirty/markSaved Date.now() fallback', () => {
  it('markDirty() with no argument uses Date.now() for dirtyAt', () => {
    const before = Date.now();
    const store = makeStore();
    store.dispatch(markDirty());
    const after = Date.now();
    const { dirtyAt } = selectSaveState(store.getState());
    expect(dirtyAt).toBeGreaterThanOrEqual(before);
    expect(dirtyAt).toBeLessThanOrEqual(after);
  });

  it('markDirty() with a non-number arg (undefined) still uses Date.now()', () => {
    const before = Date.now();
    const store = makeStore();
    store.dispatch(markDirty('not-a-number'));
    const after = Date.now();
    const { dirtyAt } = selectSaveState(store.getState());
    expect(dirtyAt).toBeGreaterThanOrEqual(before);
    expect(dirtyAt).toBeLessThanOrEqual(after);
  });

  it('markSaved() with no argument uses Date.now() for lastSavedAt', () => {
    const before = Date.now();
    const store = makeStore();
    store.dispatch(markDirty(1000));
    store.dispatch(markSaved());
    const after = Date.now();
    const { lastSavedAt } = selectSaveState(store.getState());
    expect(lastSavedAt).toBeGreaterThanOrEqual(before);
    expect(lastSavedAt).toBeLessThanOrEqual(after);
  });

  it('markSaved() with a non-number arg still uses Date.now()', () => {
    const before = Date.now();
    const store = makeStore();
    store.dispatch(markSaved('nope'));
    const after = Date.now();
    const { lastSavedAt } = selectSaveState(store.getState());
    expect(lastSavedAt).toBeGreaterThanOrEqual(before);
    expect(lastSavedAt).toBeLessThanOrEqual(after);
  });
});
