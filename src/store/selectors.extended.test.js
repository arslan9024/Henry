/**
 * selectors.extended.test.js
 * Tests for selectors not covered in selectors.test.js:
 *   - All base (primitive) selectors from selectors.js
 *   - selectLatestApprovedOcr
 *   - uiSlice selectors: selectSaveState, selectPreviewState, selectIsPreviewReady
 */
import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';

import documentReducer from './documentSlice';
import templateReducer from './templateSlice';
import complianceReducer from './complianceSlice';
import policyMetaReducer from './policyMetaSlice';
import auditReducer from './auditSlice';
import sidebarReducer from './sidebarSlice';
import henryReducer from './henrySlice';
import archiveReducer from './archiveSlice';
import ocrReducer, { setOcrDraft, approveOcrDraft } from './ocrSlice';
import uiReducer, {
  markDirty,
  markSaved,
  setPreviewReady,
  setPreviewRendering,
  setPreviewError,
  resetPreviewStatus,
} from './uiSlice';

import {
  selectActiveTemplate,
  selectDocument,
  selectPolicyMeta,
  selectSidebarState,
  selectComplianceState,
  selectHenry,
  selectArchiveState,
  selectOcrState,
  selectLatestApprovedOcr,
} from './selectors';

import { selectSaveState, selectPreviewState, selectIsPreviewReady, selectToasts } from './uiSlice';

// ── store factory ─────────────────────────────────────────────────────────────

const makeStore = (preloaded = {}) =>
  configureStore({
    reducer: {
      template: templateReducer,
      document: documentReducer,
      compliance: complianceReducer,
      policyMeta: policyMetaReducer,
      audit: auditReducer,
      sidebar: sidebarReducer,
      henry: henryReducer,
      archive: archiveReducer,
      ocr: ocrReducer,
      ui: uiReducer,
    },
    preloadedState: preloaded,
  });

// ── base selectors ────────────────────────────────────────────────────────────

describe('selectors.js — base (primitive) selectors', () => {
  it('selectActiveTemplate returns the active template string', () => {
    const store = makeStore({ template: { activeTemplate: 'booking' } });
    expect(selectActiveTemplate(store.getState())).toBe('booking');
  });

  it('selectActiveTemplate reflects a different template', () => {
    const store = makeStore({ template: { activeTemplate: 'invoice' } });
    expect(selectActiveTemplate(store.getState())).toBe('invoice');
  });

  it('selectDocument returns the document slice object', () => {
    const store = makeStore();
    const doc = selectDocument(store.getState());
    expect(doc).toBeDefined();
    expect(typeof doc).toBe('object');
    expect(doc.company).toBeDefined();
    expect(doc.property).toBeDefined();
    expect(doc.tenant).toBeDefined();
  });

  it('selectPolicyMeta returns the policyMeta slice', () => {
    const store = makeStore();
    expect(selectPolicyMeta(store.getState())).toBeDefined();
  });

  it('selectSidebarState returns the sidebar slice', () => {
    const store = makeStore();
    expect(selectSidebarState(store.getState())).toBeDefined();
  });

  it('selectComplianceState returns the compliance slice', () => {
    const store = makeStore();
    expect(selectComplianceState(store.getState())).toBeDefined();
  });

  it('selectHenry returns the henry slice with expected identity fields', () => {
    const store = makeStore();
    const henry = selectHenry(store.getState());
    expect(henry).toBeDefined();
    expect(henry.name).toBe('Henry');
    expect(henry.aiId).toBe('WC-AI-003');
    expect(henry.title).toBeDefined();
  });

  it('selectArchiveState returns the archive slice (with entries array)', () => {
    const store = makeStore();
    const archiveState = selectArchiveState(store.getState());
    expect(archiveState).toBeDefined();
    expect(Array.isArray(archiveState.entries)).toBe(true);
  });

  it('selectOcrState returns the ocr slice', () => {
    const store = makeStore();
    const ocrState = selectOcrState(store.getState());
    expect(ocrState).toBeDefined();
    expect(ocrState.processing).toBe(false);
    expect(ocrState.draft).toBeNull();
    expect(ocrState.lastApproved).toBeNull();
  });
});

// ── selectLatestApprovedOcr ───────────────────────────────────────────────────

describe('selectLatestApprovedOcr', () => {
  it('returns null initially (no OCR approved yet)', () => {
    const store = makeStore();
    expect(selectLatestApprovedOcr(store.getState())).toBeNull();
  });

  it('returns null after setOcrDraft (draft is not lastApproved)', () => {
    const store = makeStore();
    store.dispatch(setOcrDraft({ fullName: 'Ahmed', emiratesId: '784-1990-1234567-1' }));
    expect(selectLatestApprovedOcr(store.getState())).toBeNull();
  });

  it('returns the draft payload after approveOcrDraft', () => {
    const store = makeStore();
    const payload = { fullName: 'Sara Khalid', emiratesId: '784-1995-9876543-2' };
    store.dispatch(setOcrDraft(payload));
    store.dispatch(approveOcrDraft(payload));
    const latest = selectLatestApprovedOcr(store.getState());
    expect(latest).toEqual(payload);
    expect(latest.fullName).toBe('Sara Khalid');
  });

  it('returns the most recent approved payload after multiple approvals', () => {
    const store = makeStore();
    const first = { fullName: 'Ahmed Al Mansouri', emiratesId: '784-1990-0001234-1' };
    const second = { fullName: 'Mohammed Al Rashid', emiratesId: '784-1985-9876543-1' };
    store.dispatch(approveOcrDraft(first));
    store.dispatch(approveOcrDraft(second));
    expect(selectLatestApprovedOcr(store.getState())).toEqual(second);
  });

  it('is memoized — same reference when state unchanged', () => {
    const store = makeStore();
    const a = selectLatestApprovedOcr(store.getState());
    const b = selectLatestApprovedOcr(store.getState());
    expect(a).toBe(b); // reselect memoization
  });
});

// ── uiSlice selectors ─────────────────────────────────────────────────────────

describe('selectSaveState', () => {
  it('returns the initial save state object', () => {
    const store = makeStore();
    const save = selectSaveState(store.getState());
    expect(save).toBeDefined();
    expect(save.status).toBe('idle');
    expect(save.dirtyAt).toBeNull();
    expect(save.lastSavedAt).toBeNull();
  });

  it('reflects "saving" status after markDirty', () => {
    const store = makeStore();
    store.dispatch(markDirty(Date.now()));
    const save = selectSaveState(store.getState());
    expect(save.status).toBe('saving');
    expect(save.dirtyAt).not.toBeNull();
  });

  it('reflects "saved" status after markSaved', () => {
    const store = makeStore();
    store.dispatch(markDirty(Date.now()));
    store.dispatch(markSaved(Date.now()));
    const save = selectSaveState(store.getState());
    expect(save.status).toBe('saved');
    expect(save.lastSavedAt).not.toBeNull();
  });
});

describe('selectPreviewState', () => {
  it('returns the initial preview state object', () => {
    const store = makeStore();
    const preview = selectPreviewState(store.getState());
    expect(preview).toBeDefined();
    expect(preview.status).toBe('idle');
    expect(preview.lastRenderedAt).toBeNull();
  });

  it('reflects "rendering" status after setPreviewRendering', () => {
    const store = makeStore();
    store.dispatch(setPreviewRendering());
    const preview = selectPreviewState(store.getState());
    expect(preview.status).toBe('rendering');
  });

  it('reflects "ready" status and lastRenderedAt after setPreviewReady', () => {
    const store = makeStore();
    const ts = Date.now();
    store.dispatch(setPreviewReady(ts));
    const preview = selectPreviewState(store.getState());
    expect(preview.status).toBe('ready');
    expect(preview.lastRenderedAt).toBe(ts);
  });

  it('reflects "error" status after setPreviewError', () => {
    const store = makeStore();
    store.dispatch(setPreviewError('render failed'));
    const preview = selectPreviewState(store.getState());
    expect(preview.status).toBe('error');
  });

  it('returns to "idle" after resetPreviewStatus', () => {
    const store = makeStore();
    store.dispatch(setPreviewRendering());
    store.dispatch(resetPreviewStatus());
    const preview = selectPreviewState(store.getState());
    expect(preview.status).toBe('idle');
  });
});

describe('selectIsPreviewReady', () => {
  it('returns false in initial idle state', () => {
    const store = makeStore();
    expect(selectIsPreviewReady(store.getState())).toBe(false);
  });

  it('returns false while rendering', () => {
    const store = makeStore();
    store.dispatch(setPreviewRendering());
    expect(selectIsPreviewReady(store.getState())).toBe(false);
  });

  it('returns true when preview is ready', () => {
    const store = makeStore();
    store.dispatch(setPreviewReady(Date.now()));
    expect(selectIsPreviewReady(store.getState())).toBe(true);
  });

  it('returns false after error', () => {
    const store = makeStore();
    store.dispatch(setPreviewReady(Date.now()));
    store.dispatch(setPreviewError('crash'));
    expect(selectIsPreviewReady(store.getState())).toBe(false);
  });

  it('returns false after reset from ready', () => {
    const store = makeStore();
    store.dispatch(setPreviewReady(Date.now()));
    store.dispatch(resetPreviewStatus());
    expect(selectIsPreviewReady(store.getState())).toBe(false);
  });
});

describe('selectToasts', () => {
  it('returns empty array initially', () => {
    const store = makeStore();
    expect(selectToasts(store.getState())).toEqual([]);
  });

  it('returns array with one toast after pushToast dispatch', () => {
    const store = makeStore();
    store.dispatch({
      type: 'ui/pushToast',
      payload: { tone: 'info', title: 'Hello' },
    });
    expect(selectToasts(store.getState())).toHaveLength(1);
    expect(selectToasts(store.getState())[0].title).toBe('Hello');
  });

  it('returns same reference when state unchanged (no unnecessary re-renders)', () => {
    const store = makeStore();
    const a = selectToasts(store.getState());
    const b = selectToasts(store.getState());
    expect(a).toBe(b);
  });
});
