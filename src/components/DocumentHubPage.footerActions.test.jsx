import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
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

const mockedWarnings = [
  { id: 'W1', severity: 'critical', message: 'Missing Emirates ID' },
  { id: 'W2', severity: 'important', message: 'Contract date is recommended' },
];

vi.mock('../compliance/ruleEngine', () => ({
  evaluateCompliance: () => mockedWarnings,
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
  default: ({
    onTogglePreview,
    onOpenCompliance,
    onRunComplianceCheck,
    onOpenArchive,
    onOpenAudit,
    badgeLabel,
  }) => (
    <div>
      <p data-testid="footer-badge-label">{badgeLabel}</p>
      <button type="button" onClick={onTogglePreview}>
        Footer Toggle Preview
      </button>
      <button type="button" onClick={onOpenCompliance}>
        Footer Open Compliance
      </button>
      <button type="button" onClick={onRunComplianceCheck}>
        Footer Run Compliance Check
      </button>
      <button type="button" onClick={onOpenArchive}>
        Footer Open Archive
      </button>
      <button type="button" onClick={onOpenAudit}>
        Footer Open Audit
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
  const view = render(
    <Provider store={store}>
      <DocumentHubPage />
    </Provider>,
  );
  return { ...view, store };
};

afterEach(() => {
  cleanup();
  localStorage.removeItem('henry.ui.leftRail');
});

describe('DocumentHubPage footer action integration', () => {
  it('wires footer drawer actions to open compliance/archive/audit panels', () => {
    renderHub();

    fireEvent.click(screen.getByRole('button', { name: /footer open compliance/i }));
    expect(screen.getByText('Compliance Panel Stub')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /footer open archive/i }));
    expect(screen.getByText('Archive Panel Stub')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /footer open audit/i }));
    expect(screen.getByText('Audit Panel Stub')).toBeInTheDocument();
  });

  it('toggles preview mode through footer action', () => {
    renderHub();

    expect(screen.getByText('Viewing Template Stub')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /footer toggle preview/i }));
    expect(screen.getByText('Preview Stub')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /footer toggle preview/i }));
    expect(screen.getByText('Viewing Template Stub')).toBeInTheDocument();
  });

  it('runs compliance check from footer and updates compliance/audit/toast state', () => {
    const { store } = renderHub();

    fireEvent.click(screen.getByRole('button', { name: /footer run compliance check/i }));

    // Drawer should switch to compliance tab
    expect(screen.getByText('Compliance Panel Stub')).toBeInTheDocument();

    // compliance slice gets latest warnings for active template
    const warnings = store.getState().compliance.warningsByTemplate.viewing;
    expect(warnings).toHaveLength(2);
    expect(warnings[0].severity).toBe('critical');

    // audit entry is recorded
    const logs = store.getState().audit.logs;
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].type).toBe('COMPLIANCE_CHECK_RUN');
    expect(logs[0].criticalCount).toBe(1);

    // toast is pushed with error tone because critical exists
    const toasts = store.getState().ui.toasts;
    expect(toasts.length).toBeGreaterThan(0);
    expect(toasts[toasts.length - 1].tone).toBe('error');
  });

  it('passes live compliance badge label into footer action bar', () => {
    renderHub();
    expect(screen.getByTestId('footer-badge-label')).toHaveTextContent('1 critical');
  });
});
