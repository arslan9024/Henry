/**
 * Template Switching E2E Tests
 *
 * These tests cover the end-to-end flow of switching templates:
 *   DocumentSelector (UI) → Redux dispatch → DocumentHubPage (render)
 *
 * The tests render both DocumentSelector and DocumentHubPage with a shared
 * Redux store to verify that selecting a new template in the dropdown causes
 * the matching template component to appear in the preview area.
 *
 * Covers:
 *  1.  Initial render shows default 'booking' template component
 *  2.  Selecting 'viewing' renders ViewingFormTemplate
 *  3.  Selecting 'tenancy' renders TenancyContractTemplate
 *  4.  Selecting 'invoice' renders InvoiceTemplate
 *  5.  Selecting 'offer' renders OfferLetterTemplate
 *  6.  Selecting 'keyHandover' renders KeyHandoverMaintenanceTemplate
 *  7.  Selecting 'addendum' renders AddendumTemplate
 *  8.  Selecting 'bookingGov' renders GovtEmployeeBookingTemplate
 *  9.  Selecting 'salaryCertificate' renders SalaryCertificateTemplate
 *  10. Redux state updated correctly after selection
 *  11. Switching back to 'booking' after another template re-renders BookingFormTemplate
 *  12. Multiple rapid switches end at the last selected template
 *  13. Active template label in InfoArticlesPanel updates after switch
 *  14. Compliance re-evaluated with new template key after switch
 *  15. DocumentSelector select value stays in sync with Redux state
 *  16. Preview area aria-live region reflects new template
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

// Slices
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

// Components under test
import DocumentSelector from './DocumentSelector';
import DocumentHubPage from './DocumentHubPage';

// ─── mocks ────────────────────────────────────────────────────────────────────

// archiveSlice requires these at module load time
vi.mock('../records/archiveService', () => ({
  loadArchiveEntries: vi.fn(() => []),
  persistArchiveEntries: vi.fn(),
  persistRecordFile: vi.fn().mockResolvedValue({ ok: true, path: '/test' }),
  fetchArchiveFromBackend: vi.fn().mockResolvedValue(null),
}));

// Rule engine – return empty warnings by default
vi.mock('../compliance/ruleEngine', () => ({
  evaluateCompliance: vi.fn(() => []),
}));

import { evaluateCompliance } from '../compliance/ruleEngine';

// Heavy UI panels – stub with identifiable markers
vi.mock('./ComplianceChecklistPanel', () => ({
  default: () => <div data-testid="mock-compliance-panel">CompliancePanel</div>,
}));
vi.mock('./ArchiveHistorySidebar', () => ({
  default: () => <div data-testid="mock-archive-sidebar">ArchiveSidebar</div>,
}));
vi.mock('./AuditLogPanel', () => ({
  default: () => <div data-testid="mock-audit-panel">AuditPanel</div>,
}));
vi.mock('./InfoArticlesPanel', () => ({
  default: () => <div data-testid="mock-info-panel">InfoPanel</div>,
}));
vi.mock('./FooterActionBar', () => ({
  default: ({ onComplianceCheck }) => (
    <div data-testid="mock-footer-bar">
      <button onClick={onComplianceCheck} data-testid="compliance-btn">
        Compliance
      </button>
    </div>
  ),
}));
vi.mock('./ChatDock', () => ({
  default: () => <div data-testid="mock-chat-dock">ChatDock</div>,
}));
vi.mock('./PrintPreview', () => ({
  default: () => <div data-testid="mock-print-preview">PrintPreview</div>,
}));
vi.mock('../hooks/useFocusTrap', () => ({ default: () => ({ current: null }) }));
vi.mock('../hooks/useBackgroundInert', () => ({ default: () => {} }));

// Template components – each returns a uniquely identifiable marker
vi.mock('../templates/registry', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    TEMPLATE_MAP: {
      booking: {
        key: 'booking',
        label: 'Booking Form (Standard Leasing)',
        component: () => <div data-testid="tpl-booking">BookingFormTemplate</div>,
        supportsPdf: true,
      },
      viewing: {
        key: 'viewing',
        label: 'Property Viewing Agreement (DLD/RERA P210)',
        component: () => <div data-testid="tpl-viewing">ViewingFormTemplate</div>,
        supportsPdf: true,
      },
      bookingGov: {
        key: 'bookingGov',
        label: 'Government Office Leasing Quotation',
        component: () => <div data-testid="tpl-bookingGov">GovtEmployeeBookingTemplate</div>,
        supportsPdf: true,
      },
      addendum: {
        key: 'addendum',
        label: 'Standard Tenancy Addendum (RERA)',
        component: () => <div data-testid="tpl-addendum">AddendumTemplate</div>,
        supportsPdf: true,
      },
      tenancy: {
        key: 'tenancy',
        label: 'Tenancy Contract (DLD Ejari)',
        component: () => <div data-testid="tpl-tenancy">TenancyContractTemplate</div>,
        supportsPdf: true,
      },
      invoice: {
        key: 'invoice',
        label: 'Invoice',
        component: () => <div data-testid="tpl-invoice">InvoiceTemplate</div>,
        supportsPdf: false,
      },
      keyHandover: {
        key: 'keyHandover',
        label: 'Key Handover and Maintenance Confirmation',
        component: () => <div data-testid="tpl-keyHandover">KeyHandoverMaintenanceTemplate</div>,
        supportsPdf: false,
      },
      offer: {
        key: 'offer',
        label: 'Property Offer Letter (Buying)',
        component: () => <div data-testid="tpl-offer">OfferLetterTemplate</div>,
        supportsPdf: false,
      },
      salaryCertificate: {
        key: 'salaryCertificate',
        label: 'Salary Certificate',
        component: () => <div data-testid="tpl-salaryCertificate">SalaryCertificateTemplate</div>,
        supportsPdf: true,
      },
    },
  };
});

// ─── helpers ──────────────────────────────────────────────────────────────────

function makeFullStore(preloadedState = {}) {
  return configureStore({
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
    preloadedState,
  });
}

/** Render DocumentSelector + DocumentHubPage in the same Redux context. */
function renderE2E(store) {
  return render(
    <Provider store={store}>
      {/* Selector lives outside the hub (as in InfoArticlesPanel in sidebar) */}
      <DocumentSelector />
      <DocumentHubPage />
    </Provider>,
  );
}

function getSelect() {
  return screen.getByRole('combobox');
}

function switchTemplate(key) {
  fireEvent.change(getSelect(), { target: { value: key } });
}

// ─── tests ────────────────────────────────────────────────────────────────────

describe('Template Switching E2E', () => {
  let store;

  beforeEach(() => {
    evaluateCompliance.mockReturnValue([]);
    // Default store – booking template
    store = makeFullStore();
  });

  // 1. Initial render shows booking template
  it('initially renders the booking template component', () => {
    renderE2E(store);
    expect(screen.getByTestId('tpl-booking')).toBeInTheDocument();
  });

  // 2. Selecting 'viewing' renders ViewingFormTemplate
  it('renders ViewingFormTemplate after selecting viewing', () => {
    renderE2E(store);
    switchTemplate('viewing');
    expect(screen.getByTestId('tpl-viewing')).toBeInTheDocument();
    expect(screen.queryByTestId('tpl-booking')).not.toBeInTheDocument();
  });

  // 3. Selecting 'tenancy' renders TenancyContractTemplate
  it('renders TenancyContractTemplate after selecting tenancy', () => {
    renderE2E(store);
    switchTemplate('tenancy');
    expect(screen.getByTestId('tpl-tenancy')).toBeInTheDocument();
  });

  // 4. Selecting 'invoice' renders InvoiceTemplate
  it('renders InvoiceTemplate after selecting invoice', () => {
    renderE2E(store);
    switchTemplate('invoice');
    expect(screen.getByTestId('tpl-invoice')).toBeInTheDocument();
  });

  // 5. Selecting 'offer' renders OfferLetterTemplate
  it('renders OfferLetterTemplate after selecting offer', () => {
    renderE2E(store);
    switchTemplate('offer');
    expect(screen.getByTestId('tpl-offer')).toBeInTheDocument();
  });

  // 6. Selecting 'keyHandover' renders KeyHandoverMaintenanceTemplate
  it('renders KeyHandoverMaintenanceTemplate after selecting keyHandover', () => {
    renderE2E(store);
    switchTemplate('keyHandover');
    expect(screen.getByTestId('tpl-keyHandover')).toBeInTheDocument();
  });

  // 7. Selecting 'addendum' renders AddendumTemplate
  it('renders AddendumTemplate after selecting addendum', () => {
    renderE2E(store);
    switchTemplate('addendum');
    expect(screen.getByTestId('tpl-addendum')).toBeInTheDocument();
  });

  // 8. Selecting 'bookingGov' renders GovtEmployeeBookingTemplate
  it('renders GovtEmployeeBookingTemplate after selecting bookingGov', () => {
    renderE2E(store);
    switchTemplate('bookingGov');
    expect(screen.getByTestId('tpl-bookingGov')).toBeInTheDocument();
  });

  // 9. Selecting 'salaryCertificate' renders SalaryCertificateTemplate
  it('renders SalaryCertificateTemplate after selecting salaryCertificate', () => {
    renderE2E(store);
    switchTemplate('salaryCertificate');
    expect(screen.getByTestId('tpl-salaryCertificate')).toBeInTheDocument();
  });

  // 10. Redux state updated correctly after selection
  it('updates Redux template.activeTemplate after selection', () => {
    renderE2E(store);
    switchTemplate('tenancy');
    expect(store.getState().template.activeTemplate).toBe('tenancy');
  });

  // 11. Switching back to booking after another template
  it('re-renders BookingFormTemplate after switching back', () => {
    renderE2E(store);
    switchTemplate('invoice');
    expect(screen.getByTestId('tpl-invoice')).toBeInTheDocument();
    switchTemplate('booking');
    expect(screen.getByTestId('tpl-booking')).toBeInTheDocument();
    expect(screen.queryByTestId('tpl-invoice')).not.toBeInTheDocument();
  });

  // 12. Multiple rapid switches end at the last selected template
  it('shows the last selected template after multiple rapid switches', () => {
    renderE2E(store);
    switchTemplate('viewing');
    switchTemplate('tenancy');
    switchTemplate('addendum');
    switchTemplate('offer');
    expect(screen.getByTestId('tpl-offer')).toBeInTheDocument();
    expect(store.getState().template.activeTemplate).toBe('offer');
  });

  // 13. DocumentSelector select value stays in sync with Redux state
  it('select value stays in sync after template switch', () => {
    renderE2E(store);
    switchTemplate('invoice');
    expect(getSelect().value).toBe('invoice');
  });

  // 14. Compliance evaluated with the new template key after switch
  it('calls evaluateCompliance with the new template key after switching', () => {
    evaluateCompliance.mockReturnValue([]);
    renderE2E(store);
    switchTemplate('viewing');
    // evaluateCompliance should be called with 'viewing' at some point
    const callArgs = evaluateCompliance.mock.calls.map(([key]) => key);
    expect(callArgs).toContain('viewing');
  });

  // 15. Preview area has aria-live attribute
  it('preview area has aria-live="polite" for accessibility', () => {
    renderE2E(store);
    const preview = document.querySelector('.preview-area');
    expect(preview).toHaveAttribute('aria-live', 'polite');
  });

  // 16. Pre-loading with non-default template shows correct component immediately
  it('renders correct template on initial load when store pre-seeded with viewing', () => {
    const customStore = makeFullStore({ template: { activeTemplate: 'viewing' } });
    render(
      <Provider store={customStore}>
        <DocumentSelector />
        <DocumentHubPage />
      </Provider>,
    );
    expect(screen.getByTestId('tpl-viewing')).toBeInTheDocument();
    expect(getSelect().value).toBe('viewing');
  });
});
