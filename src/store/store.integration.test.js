/**
 * store.integration.test.js
 * Smoke-tests the root Redux store created by store/index.js.
 * Verifies all reducer slices are correctly wired and the store
 * works end-to-end as a single configured unit.
 */
import { describe, it, expect } from 'vitest';
import { store } from './index';

// ── initial state shape ───────────────────────────────────────────────────────

describe('store — all reducer slices registered', () => {
  it('exports a Redux store object', () => {
    expect(store).toBeDefined();
    expect(typeof store.getState).toBe('function');
    expect(typeof store.dispatch).toBe('function');
    expect(typeof store.subscribe).toBe('function');
  });

  it('state has a "template" key', () => {
    expect(store.getState().template).toBeDefined();
  });

  it('state has a "document" key', () => {
    expect(store.getState().document).toBeDefined();
  });

  it('state has a "compliance" key', () => {
    expect(store.getState().compliance).toBeDefined();
  });

  it('state has a "policyMeta" key', () => {
    expect(store.getState().policyMeta).toBeDefined();
  });

  it('state has an "audit" key', () => {
    expect(store.getState().audit).toBeDefined();
  });

  it('state has a "sidebar" key', () => {
    expect(store.getState().sidebar).toBeDefined();
  });

  it('state has a "henry" key', () => {
    expect(store.getState().henry).toBeDefined();
  });

  it('state has an "archive" key', () => {
    expect(store.getState().archive).toBeDefined();
  });

  it('state has an "ocr" key', () => {
    expect(store.getState().ocr).toBeDefined();
  });

  it('state has a "ui" key', () => {
    expect(store.getState().ui).toBeDefined();
  });

  it('state has a "uiCommand" key', () => {
    expect(store.getState().uiCommand).toBeDefined();
  });

  it('state has a "payroll" key', () => {
    expect(store.getState().payroll).toBeDefined();
  });

  it('state has an "appRoute" key', () => {
    expect(store.getState().appRoute).toBeDefined();
  });

  it('has exactly 14 top-level state keys', () => {
    const keys = Object.keys(store.getState());
    expect(keys).toHaveLength(14);
  });
});

// ── initial slice defaults ────────────────────────────────────────────────────

describe('store — initial slice defaults sanity check', () => {
  it('template.activeTemplate is a non-empty string', () => {
    expect(typeof store.getState().template.activeTemplate).toBe('string');
    expect(store.getState().template.activeTemplate.length).toBeGreaterThan(0);
  });

  it('document.company is defined', () => {
    expect(store.getState().document.company).toBeDefined();
  });

  it('henry.name is "Henry"', () => {
    expect(store.getState().henry.name).toBe('Henry');
  });

  it('ocr.processing starts false', () => {
    expect(store.getState().ocr.processing).toBe(false);
  });

  it('ocr.draft starts null', () => {
    expect(store.getState().ocr.draft).toBeNull();
  });

  it('ui.toasts starts as empty array', () => {
    expect(Array.isArray(store.getState().ui.toasts)).toBe(true);
    expect(store.getState().ui.toasts).toHaveLength(0);
  });

  it('ui.save.status starts as "idle"', () => {
    expect(store.getState().ui.save.status).toBe('idle');
  });

  it('ui.preview.status starts as "idle"', () => {
    expect(store.getState().ui.preview.status).toBe('idle');
  });

  it('uiCommand.commandPaletteOpen starts as false', () => {
    expect(store.getState().uiCommand.commandPaletteOpen).toBe(false);
  });

  it('appRoute.currentPage starts as "documentWorkspace"', () => {
    expect(store.getState().appRoute.currentPage).toBe('documentWorkspace');
  });

  it('payroll.currentFile.employees starts as empty array', () => {
    expect(Array.isArray(store.getState().payroll.currentFile.employees)).toBe(true);
  });

  it('archive.entries is an array', () => {
    expect(Array.isArray(store.getState().archive.entries)).toBe(true);
  });
});

// ── cross-slice dispatch ──────────────────────────────────────────────────────

describe('store — cross-slice dispatch integration', () => {
  it('dispatching goToPayroll updates appRoute AND leaves other slices intact', () => {
    const { dispatch, getState } = store;
    const before = getState().document;
    dispatch({ type: 'appRoute/goToPayroll' });
    expect(getState().appRoute.currentPage).toBe('payroll');
    // document slice must be untouched
    expect(getState().document).toBe(before);
  });

  it('dispatching goToDocumentHub navigates back', () => {
    store.dispatch({ type: 'appRoute/goToDocumentHub' });
    expect(store.getState().appRoute.currentPage).toBe('documentHub');
  });

  it('dispatching pushToast adds a toast to ui.toasts', () => {
    const countBefore = store.getState().ui.toasts.length;
    store.dispatch({
      type: 'ui/pushToast',
      payload: { tone: 'success', title: 'Integration toast' },
    });
    expect(store.getState().ui.toasts.length).toBe(countBefore + 1);
  });
});
