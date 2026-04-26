import { createSlice, nanoid } from '@reduxjs/toolkit';

/**
 * uiSlice — transient UI state (toasts, future global UX flags).
 * Anything persisted long-term belongs in its own domain slice; this slice
 * is intentionally ephemeral and not serialized.
 */
const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    toasts: [], // { id, tone: 'info'|'success'|'warning'|'error', title, body?, durationMs }
    // T-39 — autosave lifecycle. Status flows: idle → saving → saved.
    // `dirtyAt` is the timestamp of the most recent document mutation;
    // `lastSavedAt` is when useAutosaveDebounce flushed it.
    save: {
      status: 'idle', // 'idle' | 'saving' | 'saved'
      dirtyAt: null,
      lastSavedAt: null,
    },
    // Preview pipeline status — kept in sync with PrintPreview component.
    // Flows: idle → rendering → ready | error
    // PrintButton reads this to guard PDF export on a fresh render.
    preview: {
      status: 'idle', // 'idle' | 'rendering' | 'ready' | 'error'
      lastRenderedAt: null, // epoch ms of last successful render
    },
  },
  reducers: {
    pushToast: {
      reducer(state, action) {
        state.toasts.push(action.payload);
      },
      prepare({ tone = 'info', title, body, durationMs = 5000, action } = {}) {
        return {
          payload: {
            id: nanoid(),
            tone,
            title: title || '',
            body: body || '',
            durationMs,
            // `action` is an opt-in { label, type, payload } descriptor that
            // ToastHost dispatches when the user clicks the inline button.
            // Kept serializable so the toast can live in Redux state.
            action:
              action && action.label && action.type
                ? { label: action.label, type: action.type, payload: action.payload ?? null }
                : null,
          },
        };
      },
    },
    dismissToast(state, action) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    clearToasts(state) {
      state.toasts = [];
    },
    // Explicit dirty marker (used by tests + the document/* matcher below).
    markDirty: {
      reducer(state, action) {
        state.save.status = 'saving';
        state.save.dirtyAt = action.payload;
      },
      prepare(at) {
        return { payload: typeof at === 'number' ? at : Date.now() };
      },
    },
    markSaved: {
      reducer(state, action) {
        state.save.status = 'saved';
        state.save.lastSavedAt = action.payload;
        state.save.dirtyAt = null;
      },
      prepare(at) {
        return { payload: typeof at === 'number' ? at : Date.now() };
      },
    },
    resetSaveState(state) {
      state.save.status = 'idle';
      state.save.dirtyAt = null;
      state.save.lastSavedAt = null;
    },
    // ─── Preview status actions ─────────────────────────────────────────────
    setPreviewRendering(state) {
      state.preview.status = 'rendering';
    },
    setPreviewReady: {
      reducer(state, action) {
        state.preview.status = 'ready';
        state.preview.lastRenderedAt = action.payload;
      },
      prepare(at) {
        return { payload: typeof at === 'number' ? at : Date.now() };
      },
    },
    setPreviewError(state) {
      state.preview.status = 'error';
    },
    resetPreviewStatus(state) {
      state.preview.status = 'idle';
      state.preview.lastRenderedAt = null;
    },
  },
  extraReducers: (builder) => {
    // Auto-flag dirty + stale-preview whenever ANY document mutation lands.
    builder.addMatcher(
      (action) => typeof action?.type === 'string' && action.type.startsWith('document/'),
      (state) => {
        state.save.status = 'saving';
        state.save.dirtyAt = Date.now();
        // Mark preview stale so PrintButton is correctly gated until the
        // next successful render cycle in PrintPreview.
        if (state.preview.status === 'ready') {
          state.preview.status = 'rendering';
        }
      },
    );
  },
});

export const {
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
} = uiSlice.actions;
export const selectToasts = (state) => state.ui.toasts;
export const selectSaveState = (state) => state.ui.save;
export const selectPreviewState = (state) => state.ui.preview;
export const selectIsPreviewReady = (state) => state.ui.preview.status === 'ready';
export default uiSlice.reducer;
