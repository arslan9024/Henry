/**
 * appRouteSlice.test.js
 * Unit tests for the client-side routing slice.
 * Tests all actions (setCurrentPage, goToDocumentHub, goToPayroll)
 * and all selectors (selectCurrentPage, selectIsPayrollPage, selectIsDocumentHubPage).
 */
import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import appRouteReducer, {
  APP_PAGES,
  clearRouteContext,
  navigateToPage,
  setCurrentPage,
  goToDocumentHub,
  goToPayroll,
  selectCurrentPage,
  selectRouteContext,
  selectIsPayrollPage,
  selectIsDocumentHubPage,
} from './appRouteSlice';

const makeStore = () =>
  configureStore({
    reducer: { appRoute: appRouteReducer },
  });

// ─── Initial state ────────────────────────────────────────────────────────────

describe('appRouteSlice — initial state', () => {
  it('defaults to documentWorkspace page', () => {
    const store = makeStore();
    expect(store.getState().appRoute.currentPage).toBe('documentWorkspace');
  });

  it('selectCurrentPage returns documentWorkspace initially', () => {
    const store = makeStore();
    expect(selectCurrentPage(store.getState())).toBe('documentWorkspace');
  });

  it('selectIsDocumentHubPage returns false initially', () => {
    const store = makeStore();
    expect(selectIsDocumentHubPage(store.getState())).toBe(false);
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

describe('route context', () => {
  it('accepts validated context with object navigation payload', () => {
    const store = makeStore();

    store.dispatch(
      navigateToPage({
        page: APP_PAGES.EMIRATES_ID,
        context: {
          source: 'tenancy-builder',
          returnTo: APP_PAGES.TENANCY_BUILDER,
          ownerTag: 'landlord',
          requirement: 'landlord-emirates-id',
          autoReturn: true,
        },
      }),
    );

    expect(selectCurrentPage(store.getState())).toBe(APP_PAGES.EMIRATES_ID);
    expect(selectRouteContext(store.getState())).toEqual({
      source: 'tenancy-builder',
      returnTo: APP_PAGES.TENANCY_BUILDER,
      ownerTag: 'landlord',
      requirement: 'landlord-emirates-id',
      autoReturn: true,
    });
  });

  it('drops invalid context fields instead of persisting unsafe values', () => {
    const store = makeStore();

    store.dispatch(
      navigateToPage({
        page: APP_PAGES.TENANT_IDENTITY_DOCS,
        context: {
          returnTo: 'unknown-page',
          ownerTag: 'agent',
          documentType: 'driver-license',
          requirement: 'skip-gates',
          autoReturn: 'yes',
        },
      }),
    );

    expect(selectRouteContext(store.getState())).toBeNull();
  });

  it('clears context on legacy string navigation and explicit clear', () => {
    const store = makeStore();
    store.dispatch(
      navigateToPage({
        page: APP_PAGES.TENANT_IDENTITY_DOCS,
        context: { documentType: 'passport', returnTo: APP_PAGES.TENANCY_BUILDER },
      }),
    );

    store.dispatch(clearRouteContext());
    expect(selectRouteContext(store.getState())).toBeNull();

    store.dispatch(
      navigateToPage({
        page: APP_PAGES.EMIRATES_ID,
        context: { ownerTag: 'tenant' },
      }),
    );
    store.dispatch(navigateToPage(APP_PAGES.DOCUMENT_HUB));
    expect(selectRouteContext(store.getState())).toBeNull();
  });
});
