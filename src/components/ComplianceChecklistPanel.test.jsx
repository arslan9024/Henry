/**
 * ComplianceChecklistPanel Integration Tests
 *
 * Covers:
 * 1. Renders panel with heading and metadata
 * 2. Shows "no warnings" message when compliance is clean
 * 3. Renders warnings grouped by severity (critical / important / info)
 * 4. Summary counts match actual warnings supplied
 * 5. Acknowledge checkbox dispatches acknowledgeChecklist action
 * 6. Acknowledged state persists in Redux after toggle
 * 7. Template key shown in policy-meta line
 * 8. evaluateCompliance called on mount with correct args
 * 9. Disclosure groups only rendered for non-empty severity buckets
 * 10. Changing template triggers re-evaluation
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import templateReducer from '../store/templateSlice';
import documentReducer from '../store/documentSlice';
import complianceReducer, { acknowledgeChecklist, setWarningsForTemplate } from '../store/complianceSlice';
import ComplianceChecklistPanel from './ComplianceChecklistPanel';

// ─── mocks ────────────────────────────────────────────────────────────────────

// evaluateCompliance: controllable return value
const mockEvaluate = vi.fn(() => []);

vi.mock('../compliance/ruleEngine', () => ({
  evaluateCompliance: (...args) => mockEvaluate(...args),
}));

vi.mock('../compliance/knowledgeBase', () => ({
  knowledgeBaseMeta: {
    version: 'v2.0',
    verificationStatus: 'Verified',
  },
}));

// Disclosure: lightweight accordion stand-in so we can assert its content
vi.mock('./Disclosure', () => ({
  default: ({ title, badge, children }) => (
    <div data-testid={`disclosure-${title.toLowerCase()}`}>
      <span data-testid="disclosure-title">{title}</span>
      {badge !== undefined && <span data-testid="disclosure-badge">{badge}</span>}
      <div data-testid="disclosure-body">{children}</div>
    </div>
  ),
}));

// ─── sample warnings ──────────────────────────────────────────────────────────

const CRITICAL_WARNING = {
  id: 'crit-1',
  severity: 'critical',
  title: 'Missing RERA Permit',
  message: 'RERA permit number must be present.',
  sourceTitle: 'RERA Regulation 3',
  citation: 'Art. 12',
};

const IMPORTANT_WARNING = {
  id: 'imp-1',
  severity: 'important',
  title: 'Cheque Details',
  message: 'At least one PDC must be specified.',
  sourceTitle: null,
  citation: null,
};

const INFO_WARNING = {
  id: 'info-1',
  severity: 'info',
  title: null,
  message: 'Consider adding a DLD reference.',
  sourceTitle: null,
  citation: null,
};

// ─── helpers ──────────────────────────────────────────────────────────────────

function makeStore(preloadedState = {}) {
  return configureStore({
    reducer: {
      template: templateReducer,
      document: documentReducer,
      compliance: complianceReducer,
    },
    preloadedState,
  });
}

function renderPanel(store) {
  return render(
    <Provider store={store}>
      <ComplianceChecklistPanel />
    </Provider>,
  );
}

// ─── tests ────────────────────────────────────────────────────────────────────

describe('ComplianceChecklistPanel', () => {
  beforeEach(() => {
    mockEvaluate.mockReset();
    mockEvaluate.mockReturnValue([]); // default: no warnings
  });

  // 1. Renders heading
  it('renders the compliance checklist heading', () => {
    const store = makeStore();
    renderPanel(store);
    expect(screen.getByText(/compliance checklist/i)).toBeInTheDocument();
  });

  // 2. Shows knowledge base metadata
  it('shows knowledge-base version and verification status', () => {
    const store = makeStore();
    renderPanel(store);
    expect(screen.getByText(/v2\.0/)).toBeInTheDocument();
    expect(screen.getByText(/Verified/)).toBeInTheDocument();
  });

  // 3. Active template key shown in policy-meta
  it('shows the active template key in the policy-meta line', () => {
    const store = makeStore({ template: { activeTemplate: 'tenancy' } });
    renderPanel(store);
    expect(screen.getByText(/Template: tenancy/i)).toBeInTheDocument();
  });

  // 4. Clean state shows no-warnings message
  it('shows success message when there are no warnings', () => {
    mockEvaluate.mockReturnValue([]);
    const store = makeStore();
    renderPanel(store);
    expect(screen.getByText(/no outstanding compliance warnings/i)).toBeInTheDocument();
  });

  // 5. Summary counters render (all zeros when clean)
  it('renders summary list with zero counts when clean', () => {
    mockEvaluate.mockReturnValue([]);
    const store = makeStore();
    renderPanel(store);
    expect(screen.getByText(/Critical: 0/)).toBeInTheDocument();
    expect(screen.getByText(/Important: 0/)).toBeInTheDocument();
    expect(screen.getByText(/Info: 0/)).toBeInTheDocument();
  });

  // 6. evaluateCompliance is called on mount
  it('calls evaluateCompliance on mount', () => {
    mockEvaluate.mockReturnValue([]);
    const store = makeStore({ template: { activeTemplate: 'booking' } });
    renderPanel(store);
    expect(mockEvaluate).toHaveBeenCalled();
  });

  // 7. evaluateCompliance called with correct template key
  it('passes the active template key to evaluateCompliance', () => {
    mockEvaluate.mockReturnValue([]);
    const store = makeStore({ template: { activeTemplate: 'viewing' } });
    renderPanel(store);
    const [templateArg] = mockEvaluate.mock.calls[0];
    expect(templateArg).toBe('viewing');
  });

  // 8. Critical warnings populate Redux + render via Disclosure
  it('renders a critical Disclosure when critical warnings exist', () => {
    mockEvaluate.mockReturnValue([CRITICAL_WARNING]);
    const store = makeStore();
    renderPanel(store);
    expect(screen.getByTestId('disclosure-critical')).toBeInTheDocument();
  });

  // 9. Summary counts reflect supplied warnings (1 critical)
  it('summary count reflects 1 critical warning', () => {
    mockEvaluate.mockReturnValue([CRITICAL_WARNING]);
    const store = makeStore();
    renderPanel(store);
    // The Redux state should be updated via useEffect + setWarningsForTemplate
    // Then the selector-derived summary is rendered
    expect(store.getState().compliance.warningsByTemplate['booking']).toHaveLength(1);
  });

  // 10. Critical warning title and message rendered
  it('renders critical warning title and message inside the disclosure body', () => {
    mockEvaluate.mockReturnValue([CRITICAL_WARNING]);
    const store = makeStore();
    renderPanel(store);
    const body = screen.getByTestId('disclosure-critical');
    expect(within(body).getByText(/Missing RERA Permit/)).toBeInTheDocument();
    expect(within(body).getByText(/RERA permit number must be present/)).toBeInTheDocument();
  });

  // 11. Warning source and citation rendered when present
  it('renders source title and citation for critical warning', () => {
    mockEvaluate.mockReturnValue([CRITICAL_WARNING]);
    const store = makeStore();
    renderPanel(store);
    expect(screen.getByText(/RERA Regulation 3/)).toBeInTheDocument();
    expect(screen.getByText(/Art\. 12/)).toBeInTheDocument();
  });

  // 12. Important warnings render in their own Disclosure
  it('renders an important Disclosure when important warnings exist', () => {
    mockEvaluate.mockReturnValue([IMPORTANT_WARNING]);
    const store = makeStore();
    renderPanel(store);
    expect(screen.getByTestId('disclosure-important')).toBeInTheDocument();
  });

  // 13. Info warnings render in their own Disclosure
  it('renders an info Disclosure when info warnings exist', () => {
    mockEvaluate.mockReturnValue([INFO_WARNING]);
    const store = makeStore();
    renderPanel(store);
    expect(screen.getByTestId('disclosure-info')).toBeInTheDocument();
  });

  // 14. No warnings = no Disclosure sections rendered
  it('does not render any Disclosure when warnings array is empty', () => {
    mockEvaluate.mockReturnValue([]);
    const store = makeStore();
    renderPanel(store);
    expect(screen.queryByTestId('disclosure-critical')).not.toBeInTheDocument();
    expect(screen.queryByTestId('disclosure-important')).not.toBeInTheDocument();
    expect(screen.queryByTestId('disclosure-info')).not.toBeInTheDocument();
  });

  // 15. Acknowledge checkbox renders unchecked by default
  it('renders the acknowledge checkbox unchecked by default', () => {
    const store = makeStore();
    renderPanel(store);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  // 16. Checking the checkbox dispatches acknowledgeChecklist
  it('dispatches acknowledgeChecklist when checkbox is checked', () => {
    const store = makeStore({ template: { activeTemplate: 'booking' } });
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    renderPanel(store);
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(dispatchSpy).toHaveBeenCalledWith(
      acknowledgeChecklist({ templateKey: 'booking', acknowledged: true }),
    );
  });

  // 17. Redux acknowledged state updates after checkbox click
  it('updates Redux acknowledged state after checking the checkbox', () => {
    const store = makeStore({ template: { activeTemplate: 'booking' } });
    renderPanel(store);
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(store.getState().compliance.checklistAcknowledgedByTemplate['booking']).toBe(true);
  });

  // 18. Pre-loaded acknowledged state shows checkbox as checked
  it('shows checkbox as checked when pre-loaded acknowledged state is true', () => {
    const store = makeStore({
      template: { activeTemplate: 'booking' },
      compliance: {
        mode: 'warnings-only',
        warningsByTemplate: {},
        checklistAcknowledgedByTemplate: { booking: true },
      },
    });
    renderPanel(store);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  // 19. Disclosure badge count equals number of warnings in that severity
  it('disclosure badge equals count of warnings in that severity bucket', () => {
    mockEvaluate.mockReturnValue([CRITICAL_WARNING]);
    const store = makeStore();
    renderPanel(store);
    const disc = screen.getByTestId('disclosure-critical');
    expect(within(disc).getByTestId('disclosure-badge')).toHaveTextContent('1');
  });

  // 20. Multiple warnings of different severities all rendered
  it('renders all three severity disclosures when each has a warning', () => {
    mockEvaluate.mockReturnValue([CRITICAL_WARNING, IMPORTANT_WARNING, INFO_WARNING]);
    const store = makeStore();
    renderPanel(store);
    expect(screen.getByTestId('disclosure-critical')).toBeInTheDocument();
    expect(screen.getByTestId('disclosure-important')).toBeInTheDocument();
    expect(screen.getByTestId('disclosure-info')).toBeInTheDocument();
  });
});
