import React from 'react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent, act, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import templateReducer from '../store/templateSlice';
import documentReducer from '../store/documentSlice';
import complianceReducer from '../store/complianceSlice';
import policyMetaReducer from '../store/policyMetaSlice';
import auditReducer from '../store/auditSlice';
import sidebarReducer from '../store/sidebarSlice';
import henryReducer from '../store/henrySlice';
import archiveReducer from '../store/archiveSlice';
import ocrReducer from '../store/ocrSlice';
import uiReducer from '../store/uiSlice';
import uiCommandReducer, { openDrawer, triggerPrint } from '../store/uiCommandSlice';

const printClickSpy = vi.fn();

vi.mock('./ComplianceChecklistPanel', () => ({
  default: () => <div>Compliance Panel Stub</div>,
}));
vi.mock('./ArchiveHistorySidebar', () => ({
  default: () => <div>Archive Panel Stub</div>,
}));
vi.mock('./AuditLogPanel', () => ({
  default: () => <div>Audit Panel Stub</div>,
}));
vi.mock('./InfoArticlesPanel', () => ({
  default: () => <div>Info Articles Stub</div>,
}));
vi.mock('./ChatDock', () => ({
  default: () => null,
}));
vi.mock('./PrintPreview', () => ({
  default: () => <div>Preview Stub</div>,
}));
vi.mock('../hooks/useFocusTrap', () => ({
  default: () => ({ current: null }),
}));
vi.mock('../hooks/useBackgroundInert', () => ({
  default: () => {},
}));
vi.mock('../compliance/ruleEngine', () => ({
  evaluateCompliance: () => [],
}));
vi.mock('../templates/registry', () => ({
  TEMPLATE_CONFIG: [
    {
      key: 'viewing',
      label: 'Viewing Form',
      supportsPdf: true,
      component: () => <div>Viewing Template Stub</div>,
    },
  ],
  TEMPLATE_MAP: {
    viewing: {
      key: 'viewing',
      label: 'Viewing Form',
      supportsPdf: true,
      component: () => <div>Viewing Template Stub</div>,
    },
  },
}));

vi.mock('./FooterActionBar', () => ({
  default: () => (
    <div>
      <button type="button" className="footer-print-btn" onClick={printClickSpy}>
        Mock Print
      </button>
    </div>
  ),
}));

import DocumentHubPage from './DocumentHubPage';

const makeStore = () =>
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
      uiCommand: uiCommandReducer,
    },
    preloadedState: {
      template: {
        activeTemplate: 'viewing',
      },
    },
  });

const renderHub = () => {
  const store = makeStore();
  return {
    store,
    ...render(
      <Provider store={store}>
        <DocumentHubPage />
      </Provider>,
    ),
  };
};

beforeEach(() => {
  printClickSpy.mockClear();
});

afterEach(() => {
  cleanup();
  localStorage.removeItem('henry.ui.leftRail');
});

describe('DocumentHubPage command events', () => {
  it('opens compliance drawer when openDrawer("compliance") is dispatched', () => {
    const { store } = renderHub();

    act(() => {
      store.dispatch(openDrawer('compliance'));
    });

    expect(screen.getByText('Compliance Panel Stub')).toBeInTheDocument();
  });

  it('opens archive drawer when openDrawer("archive") is dispatched', () => {
    const { store } = renderHub();

    act(() => {
      store.dispatch(openDrawer('archive'));
    });

    expect(screen.getByText('Archive Panel Stub')).toBeInTheDocument();
  });

  it('opens audit drawer when openDrawer("audit") is dispatched', () => {
    const { store } = renderHub();

    act(() => {
      store.dispatch(openDrawer('audit'));
    });

    expect(screen.getByText('Audit Panel Stub')).toBeInTheDocument();
  });

  it('triggers footer print button when triggerPrint() is dispatched', async () => {
    const { store } = renderHub();

    act(() => {
      store.dispatch(triggerPrint());
    });

    await waitFor(() => expect(printClickSpy).toHaveBeenCalledTimes(1));
  });

  it('closes drawer on Escape key', () => {
    const { store } = renderHub();

    act(() => {
      store.dispatch(openDrawer('compliance'));
    });
    expect(screen.getByText('Compliance Panel Stub')).toBeInTheDocument();

    act(() => {
      fireEvent.keyDown(window, { key: 'Escape' });
    });

    expect(screen.queryByText('Compliance Panel Stub')).not.toBeInTheDocument();
  });
});
