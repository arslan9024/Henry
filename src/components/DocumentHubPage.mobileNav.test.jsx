import React from 'react';
import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent, within } from '@testing-library/react';
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
vi.mock('./FooterActionBar', () => ({
  default: () => <div>Footer Stub</div>,
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
    },
  });

const renderHub = () => {
  const store = makeStore();
  return render(
    <Provider store={store}>
      <DocumentHubPage />
    </Provider>,
  );
};

afterEach(() => {
  cleanup();
  try {
    localStorage.removeItem('henry.ui.leftRail');
  } catch {
    // noop
  }
});

describe('DocumentHubPage mobile drawer navigation (T-42)', () => {
  beforeEach(() => {
    try {
      localStorage.setItem('henry.ui.leftRail', 'collapsed');
    } catch {
      // noop
    }
  });

  it('renders mobile quick navigation actions', () => {
    renderHub();
    const nav = screen.getByRole('navigation', { name: /mobile drawer navigation/i });

    expect(within(nav).getByRole('button', { name: /open left rail/i })).toBeInTheDocument();
    expect(within(nav).getByRole('button', { name: /open compliance drawer/i })).toBeInTheDocument();
    expect(within(nav).getByRole('button', { name: /open archive drawer/i })).toBeInTheDocument();
    expect(within(nav).getByRole('button', { name: /open audit drawer/i })).toBeInTheDocument();
  });

  it('opens compliance drawer from mobile quick navigation', () => {
    renderHub();
    const nav = screen.getByRole('navigation', { name: /mobile drawer navigation/i });

    fireEvent.click(within(nav).getByRole('button', { name: /open compliance drawer/i }));

    expect(screen.getByText('Compliance Panel Stub')).toBeInTheDocument();
  });

  it('opens archive drawer from mobile quick navigation', () => {
    renderHub();
    const nav = screen.getByRole('navigation', { name: /mobile drawer navigation/i });

    fireEvent.click(within(nav).getByRole('button', { name: /open archive drawer/i }));

    expect(screen.getByText('Archive Panel Stub')).toBeInTheDocument();
  });

  it('opens audit drawer from mobile quick navigation', () => {
    renderHub();
    const nav = screen.getByRole('navigation', { name: /mobile drawer navigation/i });

    fireEvent.click(within(nav).getByRole('button', { name: /open audit drawer/i }));

    expect(screen.getByText('Audit Panel Stub')).toBeInTheDocument();
  });

  it('menu action expands collapsed left rail', () => {
    renderHub();
    expect(screen.queryByText('Info Articles Stub')).not.toBeInTheDocument();

    const nav = screen.getByRole('navigation', { name: /mobile drawer navigation/i });
    fireEvent.click(within(nav).getByRole('button', { name: /open left rail/i }));

    expect(screen.getByText('Info Articles Stub')).toBeInTheDocument();
  });
});
