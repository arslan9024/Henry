/**
 * appRouteSlice.test.js
 * Unit tests for the client-side routing slice.
 * Tests all actions (setCurrentPage, goToDocumentHub, goToPayroll)
 * and all selectors (selectCurrentPage, selectIsPayrollPage, selectIsDocumentHubPage).
 */
import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import appRouteReducer, {
  setCurrentPage,
  goToDocumentHub,
  goToPayroll,
  selectCurrentPage,
  selectIsPayrollPage,
  selectIsDocumentHubPage,
} from './appRouteSlice';

const makeStore = () =>
  configureStore({
    reducer: { appRoute: appRouteReducer },
  });

// ─── Initial state ────────────────────────────────────────────────────────────

describe('appRouteSlice — initial state', () => {
  it('defaults to documentHub page', () => {
    const store = makeStore();
    expect(store.getState().appRoute.currentPage).toBe('documentHub');
  });

  it('selectCurrentPage returns documentHub initially', () => {
    const store = makeStore();
    expect(selectCurrentPage(store.getState())).toBe('documentHub');
  });

  it('selectIsDocumentHubPage returns true initially', () => {
    const store = makeStore();
    expect(selectIsDocumentHubPage(store.getState())).toBe(true);
  });

  it('selectIsPayrollPage returns false initially', () => {
    const store = makeStore();
    expect(selectIsPayrollPage(store.getState())).toBe(false);
  });
});

// ─── goToPayroll ──────────────────────────────────────────────────────────────

describe('goToPayroll', () => {
  it('sets currentPage to payroll', () => {
    const store = makeStore();
    store.dispatch(goToPayroll());
    expect(selectCurrentPage(store.getState())).toBe('payroll');
  });

  it('selectIsPayrollPage becomes true', () => {
    const store = makeStore();
    store.dispatch(goToPayroll());
    expect(selectIsPayrollPage(store.getState())).toBe(true);
  });

  it('selectIsDocumentHubPage becomes false', () => {
    const store = makeStore();
    store.dispatch(goToPayroll());
    expect(selectIsDocumentHubPage(store.getState())).toBe(false);
  });
});

// ─── goToDocumentHub ─────────────────────────────────────────────────────────

describe('goToDocumentHub', () => {
  it('sets currentPage back to documentHub after payroll', () => {
    const store = makeStore();
    store.dispatch(goToPayroll());
    store.dispatch(goToDocumentHub());
    expect(selectCurrentPage(store.getState())).toBe('documentHub');
  });

  it('selectIsDocumentHubPage is true after navigating back', () => {
    const store = makeStore();
    store.dispatch(goToPayroll());
    store.dispatch(goToDocumentHub());
    expect(selectIsDocumentHubPage(store.getState())).toBe(true);
  });

  it('selectIsPayrollPage is false after navigating back', () => {
    const store = makeStore();
    store.dispatch(goToPayroll());
    store.dispatch(goToDocumentHub());
    expect(selectIsPayrollPage(store.getState())).toBe(false);
  });
});

// ─── setCurrentPage ──────────────────────────────────────────────────────────

describe('setCurrentPage', () => {
  it('sets an arbitrary page string', () => {
    const store = makeStore();
    store.dispatch(setCurrentPage('payroll'));
    expect(selectCurrentPage(store.getState())).toBe('payroll');
  });

  it('can switch back to documentHub via setCurrentPage', () => {
    const store = makeStore();
    store.dispatch(setCurrentPage('payroll'));
    store.dispatch(setCurrentPage('documentHub'));
    expect(selectCurrentPage(store.getState())).toBe('documentHub');
  });

  it('selectIsPayrollPage uses currentPage for comparison', () => {
    const store = makeStore();
    store.dispatch(setCurrentPage('payroll'));
    expect(selectIsPayrollPage(store.getState())).toBe(true);
    store.dispatch(setCurrentPage('documentHub'));
    expect(selectIsPayrollPage(store.getState())).toBe(false);
  });
});
