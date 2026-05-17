import React from 'react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react';
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
vi.mock('./PrintPreviewModal', () => ({
  default: ({ isOpen }) => (isOpen ? <div data-testid="preview-modal">Modal Preview</div> : null),
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
  default: () => <div>Mock Footer</div>,
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
  const view = render(
    <Provider store={store}>
      <DocumentHubPage />
    </Provider>,
  );
  return { store, ...view };
};

afterEach(() => {
  cleanup();
  localStorage.removeItem('henry.ui.leftRail');
});

describe('DocumentHubPage command state', () => {
  it('opens compliance drawer when the Redux command requests it', () => {
    const { store } = renderHub();
    act(() => {
      store.dispatch(openDrawer('compliance'));
    });
    expect(screen.getByText('Compliance Panel Stub')).toBeInTheDocument();
  });

  it('opens archive drawer when the Redux command requests it', () => {
    const { store } = renderHub();
    act(() => {
      store.dispatch(openDrawer('archive'));
    });
    expect(screen.getByText('Archive Panel Stub')).toBeInTheDocument();
  });

  it('opens audit drawer when the Redux command requests it', () => {
    const { store } = renderHub();
    act(() => {
      store.dispatch(openDrawer('audit'));
    });
    expect(screen.getByText('Audit Panel Stub')).toBeInTheDocument();
  });

  it('opens preview modal when triggerPrint is dispatched', () => {
    const { store } = renderHub();

    expect(screen.queryByTestId('preview-modal')).not.toBeInTheDocument();

    act(() => {
      store.dispatch(triggerPrint());
    });

    expect(screen.getByTestId('preview-modal')).toBeInTheDocument();
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
    expect(store.getState().uiCommand.drawerTab).toBeNull();
  });
});
