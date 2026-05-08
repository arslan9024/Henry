import React from 'react';
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
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
import uiCommandReducer from '../store/uiCommandSlice';

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
  return render(
    <Provider store={store}>
      <DocumentHubPage />
    </Provider>,
  );
};

beforeEach(() => {
  localStorage.setItem('henry.ui.leftRail', 'collapsed');
});

afterEach(() => {
  cleanup();
  localStorage.removeItem('henry.ui.leftRail');
});

describe('DocumentHubPage drawer controls', () => {
  it('closes the opened drawer from the top close button', () => {
    renderHub();

    const nav = screen.getByRole('navigation', { name: /mobile drawer navigation/i });
    fireEvent.click(within(nav).getByRole('button', { name: /open compliance drawer/i }));
    expect(screen.getByText('Compliance Panel Stub')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /close drawer/i }));
    expect(screen.queryByText('Compliance Panel Stub')).not.toBeInTheDocument();
  });

  it('closes the opened drawer from the scrim click', () => {
    renderHub();

    const nav = screen.getByRole('navigation', { name: /mobile drawer navigation/i });
    fireEvent.click(within(nav).getByRole('button', { name: /open archive drawer/i }));
    expect(screen.getByText('Archive Panel Stub')).toBeInTheDocument();

    const scrim = document.querySelector('.right-drawer__scrim');
    expect(scrim).toBeTruthy();
    fireEvent.click(scrim);

    expect(screen.queryByText('Archive Panel Stub')).not.toBeInTheDocument();
  });

  it('switches active drawer panel using drawer tabs', () => {
    renderHub();

    const nav = screen.getByRole('navigation', { name: /mobile drawer navigation/i });
    fireEvent.click(within(nav).getByRole('button', { name: /open compliance drawer/i }));
    expect(screen.getByText('Compliance Panel Stub')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /archive/i }));
    expect(screen.getByText('Archive Panel Stub')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /audit/i }));
    expect(screen.getByText('Audit Panel Stub')).toBeInTheDocument();
  });

  it('updates aria-selected on drawer tabs when switching', () => {
    renderHub();

    const nav = screen.getByRole('navigation', { name: /mobile drawer navigation/i });
    fireEvent.click(within(nav).getByRole('button', { name: /open compliance drawer/i }));

    const complianceTab = screen.getByRole('tab', { name: /compliance/i });
    const archiveTab = screen.getByRole('tab', { name: /archive/i });
    const auditTab = screen.getByRole('tab', { name: /audit/i });

    expect(complianceTab).toHaveAttribute('aria-selected', 'true');
    expect(archiveTab).toHaveAttribute('aria-selected', 'false');
    expect(auditTab).toHaveAttribute('aria-selected', 'false');

    fireEvent.click(archiveTab);
    expect(complianceTab).toHaveAttribute('aria-selected', 'false');
    expect(archiveTab).toHaveAttribute('aria-selected', 'true');

    fireEvent.click(auditTab);
    expect(auditTab).toHaveAttribute('aria-selected', 'true');
  });
});
