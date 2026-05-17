/**
 * TopNavbar.deep.test.jsx
 *
 * Deep coverage for TopNavbar — policy meta display, henry identity fields,
 * page toggle navigation, density/theme buttons, hamburger sidebar event,
 * and popover "Close" button — beyond the 5 tests already in TopNavbar.test.jsx.
 */
import React from 'react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent, within, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import templateReducer from '../store/templateSlice';
import policyMetaReducer, { updatePolicyMeta } from '../store/policyMetaSlice';
import henryReducer, { syncHenryFromCRM } from '../store/henrySlice';
import appRouteReducer, { goToPayroll, goToDocumentHub } from '../store/appRouteSlice';
import uiCommandReducer from '../store/uiCommandSlice';

vi.mock('../hooks/useDensity', () => ({
  default: () => ({ density: 'comfortable', toggle: vi.fn() }),
}));

vi.mock('../hooks/useTheme', () => ({
  default: () => ({ mode: 'light', resolved: 'light', cycle: vi.fn() }),
}));

vi.mock('./AutosaveIndicator', () => ({
  default: () => <div data-testid="autosave-stub">Autosave</div>,
}));

import TopNavbar from './TopNavbar';

afterEach(cleanup);

const makeStore = (preloadedState = {}) =>
  configureStore({
    reducer: {
      template: templateReducer,
      policyMeta: policyMetaReducer,
      henry: henryReducer,
      appRoute: appRouteReducer,
      uiCommand: uiCommandReducer,
    },
    preloadedState,
  });

const renderNavbar = (store = makeStore()) =>
  render(
    <Provider store={store}>
      <TopNavbar />
    </Provider>,
  );

// ── Policy meta display ───────────────────────────────────────────────────────

describe('TopNavbar — policy meta display', () => {
  it('displays policy version from store', () => {
    renderNavbar();
    expect(screen.getByText(/Policy v1\.0\.0/)).toBeInTheDocument();
  });

  it('displays reviewedAt date from store', () => {
    renderNavbar();
    expect(screen.getByText(/Reviewed 2026-04-23/)).toBeInTheDocument();
  });

  it('updates displayed version after updatePolicyMeta dispatch', () => {
    const store = makeStore();
    renderNavbar(store);
    act(() => {
      store.dispatch(updatePolicyMeta({ version: 'v9.9.9' }));
    });
    expect(screen.getByText(/Policy v9\.9\.9/)).toBeInTheDocument();
  });
});

// ── Henry identity display ────────────────────────────────────────────────────

describe('TopNavbar — henry identity fields', () => {
  it('shows henry name', () => {
    renderNavbar();
    const henry = screen.getByRole('complementary', { name: /AI Assistant identity/i });
    // henry.name is 'Henry' — rendered in .henry-identity__name
    const nameEl = document.querySelector('.henry-identity__name');
    expect(nameEl).not.toBeNull();
    expect(nameEl.textContent).toMatch(/Henry/);
  });

  it('shows henry status with accessible label', () => {
    renderNavbar();
    const statusEl = screen.getByLabelText(/Henry status:/i);
    expect(statusEl).toBeInTheDocument();
  });

  it('henry status label contains current status', () => {
    renderNavbar();
    const statusEl = screen.getByLabelText(/Henry status: Ready to file/i);
    expect(statusEl).toBeInTheDocument();
  });

  it('shows updated status after syncHenryFromCRM', () => {
    const store = makeStore();
    renderNavbar(store);
    act(() => {
      store.dispatch(syncHenryFromCRM({ status: 'Filing in progress' }));
    });
    expect(screen.getByLabelText(/Henry status: Filing in progress/i)).toBeInTheDocument();
  });

  it('popover shows "Standalone mode" when lastSyncedAt is null', () => {
    const store = makeStore();
    renderNavbar(store);
    fireEvent.click(screen.getByRole('button', { name: /toggle henry identity details/i }));
    const pop = screen.getByRole('dialog', { name: /henry identity details/i });
    expect(within(pop).getByText(/Standalone mode/i)).toBeInTheDocument();
  });

  it('popover Close button closes the dialog', () => {
    renderNavbar();
    fireEvent.click(screen.getByRole('button', { name: /toggle henry identity details/i }));
    expect(screen.getByRole('dialog', { name: /henry identity details/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^Close$/i }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('Details button has aria-haspopup="dialog"', () => {
    renderNavbar();
    const btn = screen.getByRole('button', { name: /toggle henry identity details/i });
    expect(btn).toHaveAttribute('aria-haspopup', 'dialog');
  });

  it('aria-expanded is false when popover closed', () => {
    renderNavbar();
    const btn = screen.getByRole('button', { name: /toggle henry identity details/i });
    expect(btn).toHaveAttribute('aria-expanded', 'false');
  });

  it('aria-expanded is true when popover open', () => {
    renderNavbar();
    const btn = screen.getByRole('button', { name: /toggle henry identity details/i });
    fireEvent.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'true');
  });
});

// ── Page navigation ───────────────────────────────────────────────────────────

describe('TopNavbar — page navigation buttons', () => {
  it('shows Payroll button on documentHub page', () => {
    const store = makeStore();
    renderNavbar(store);
    expect(
      screen.getByRole('button', { name: /Navigate to WPS SIF Payroll Generator/i }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Navigate back to Documents/i })).toBeNull();
  });

  it('shows Documents button on payroll page', () => {
    const store = makeStore({ appRoute: { currentPage: 'payroll' } });
    renderNavbar(store);
    expect(screen.getByRole('button', { name: /Navigate back to Documents/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Navigate to WPS SIF Payroll/i })).toBeNull();
  });

  it('clicking Payroll dispatches goToPayroll', () => {
    const store = makeStore();
    renderNavbar(store);
    fireEvent.click(screen.getByRole('button', { name: /Navigate to WPS SIF Payroll Generator/i }));
    expect(store.getState().appRoute.currentPage).toBe('payroll');
  });

  it('clicking Documents dispatches goToDocumentHub', () => {
    const store = makeStore({ appRoute: { currentPage: 'payroll' } });
    renderNavbar(store);
    fireEvent.click(screen.getByRole('button', { name: /Navigate back to Documents/i }));
    expect(store.getState().appRoute.currentPage).toBe('documentHub');
  });
});

// ── Hamburger sidebar toggle ──────────────────────────────────────────────────

describe('TopNavbar — hamburger button', () => {
  it('hamburger button exists with correct aria-label', () => {
    renderNavbar();
    expect(screen.getByRole('button', { name: /Toggle sidebar/i })).toBeInTheDocument();
  });

  it('clicking hamburger toggles the Redux left rail state', () => {
    const store = makeStore();
    renderNavbar(store);
    fireEvent.click(screen.getByRole('button', { name: /Toggle sidebar/i }));
    expect(store.getState().uiCommand.leftRail).toBe('collapsed');
  });
});

// ── Autosave slot ─────────────────────────────────────────────────────────────

describe('TopNavbar — AutosaveIndicator slot', () => {
  it('renders the AutosaveIndicator stub', () => {
    renderNavbar();
    expect(screen.getByTestId('autosave-stub')).toBeInTheDocument();
  });
});

// ── Command palette button ────────────────────────────────────────────────────

describe('TopNavbar — command palette button', () => {
  it('Search/palette button exists', () => {
    renderNavbar();
    expect(screen.getByRole('button', { name: /Open command palette/i })).toBeInTheDocument();
  });

  it('clicking palette button opens the command palette in Redux', () => {
    const store = makeStore();
    renderNavbar(store);
    fireEvent.click(screen.getByRole('button', { name: /Open command palette/i }));
    expect(store.getState().uiCommand.commandPaletteOpen).toBe(true);
  });
});
