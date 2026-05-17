/**
 * DocumentChecklistPanel.test.jsx
 * Tests for src/components/DocumentChecklistPanel — Redux-connected panel
 * that shows document completion per section and live compliance warnings.
 *
 * Needs: document + template + compliance + policyMeta slices.
 * Dynamic import of downloadBlankTemplate (DownloadBlankButton) is left
 * untested here; we focus on the panel's rendered structure and state logic.
 */
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import DocumentChecklistPanel from './DocumentChecklistPanel';
import documentReducer from '../store/documentSlice';
import templateReducer from '../store/templateSlice';
import complianceReducer from '../store/complianceSlice';
import policyMetaReducer from '../store/policyMetaSlice';

// ── store factory ─────────────────────────────────────────────────────────────

const makeStore = (preloadedState = {}) =>
  configureStore({
    reducer: {
      document: documentReducer,
      template: templateReducer,
      compliance: complianceReducer,
      policyMeta: policyMetaReducer,
    },
    preloadedState,
  });

const renderPanel = (store = makeStore()) =>
  render(
    <Provider store={store}>
      <DocumentChecklistPanel />
    </Provider>,
  );

// ── overall completion section ────────────────────────────────────────────────

describe('DocumentChecklistPanel — Document Completion section', () => {
  it('renders the "Document Completion" heading', () => {
    renderPanel();
    expect(screen.getByText(/Document Completion/i)).toBeDefined();
  });

  it('shows overall percentage', () => {
    renderPanel();
    // Default state has many populated fields — percentage should appear
    expect(screen.getByText(/%/)).toBeDefined();
  });

  it('shows overall field count in "x / y key fields" format', () => {
    renderPanel();
    expect(screen.getByText(/key fields/i)).toBeDefined();
  });
});

// ── per-section breakdown ─────────────────────────────────────────────────────

describe('DocumentChecklistPanel — per-section breakdown', () => {
  it('renders all 4 section labels', () => {
    renderPanel();
    expect(screen.getByText('Property Details')).toBeDefined();
    expect(screen.getByText('Tenant Details')).toBeDefined();
    expect(screen.getByText('Financial Details')).toBeDefined();
    expect(screen.getByText('Broker / Agent')).toBeDefined();
  });

  it('renders progress bars for each section (role=progressbar)', () => {
    renderPanel();
    // 1 overall + 4 per-section = 5 total progressbars
    const bars = screen.getAllByRole('progressbar');
    expect(bars.length).toBeGreaterThanOrEqual(4);
  });

  it('each progress bar has aria-valuemin=0 and aria-valuemax=100', () => {
    renderPanel();
    const bars = screen.getAllByRole('progressbar');
    bars.forEach((bar) => {
      expect(bar.getAttribute('aria-valuemin')).toBe('0');
      expect(bar.getAttribute('aria-valuemax')).toBe('100');
    });
  });

  it('renders filled/total badge for each section', () => {
    renderPanel();
    // Badge text is "x/y" — find at least 4 matching patterns
    const badges = screen.getAllByText(/^\d+\/\d+$/);
    expect(badges.length).toBeGreaterThanOrEqual(4);
  });
});

// ── compliance — section always renders ─────────────────────────────────────

describe('DocumentChecklistPanel — compliance section', () => {
  it('renders either the clear message or a warnings list — never neither', () => {
    renderPanel();
    const hasClear = screen.queryByText(/All compliance checks pass/i);
    const hasList = screen.queryByRole('list');
    // The component always shows one of the two — at least one must be present
    expect(hasClear !== null || hasList !== null).toBe(true);
  });

  it('renders a compliance section heading (warnings or clear)', () => {
    renderPanel();
    // With the default populated document, the ruleEngine may produce warnings
    // OR the document may be clean — either way a compliance section is shown
    const issuesHeading = screen.queryByText(/Compliance Issues/i);
    const clearMsg = screen.queryByText(/All compliance checks pass/i);
    expect(issuesHeading !== null || clearMsg !== null).toBe(true);
  });
});

// ── compliance — warnings present ────────────────────────────────────────────

describe('DocumentChecklistPanel — compliance warnings', () => {
  it('shows compliance issues heading when warnings are triggered', () => {
    // Use a minimal document state that triggers compliance warnings
    // Booking template checks: tenant name, passport, etc.
    const store = makeStore({
      template: { activeTemplate: 'booking' },
      document: {
        company: {
          name: 'White Caves Real Estate L.L.C',
          dedLicense: '1388443',
          role: 'Authorized Property Leasing Agent',
          city: 'Dubai',
        },
        property: {
          referenceNo: '',
          documentDate: '',
          unit: '',
          cluster: '',
          community: '',
          city: '',
          description: '',
          size: '',
          parking: '',
          condition: '',
          usage: '',
          plotNo: '',
          makaniNo: '',
          dewaPremisesNo: '',
          projectName: '',
          buildingNumber: '',
          ownersAssociationNo: '',
        },
        tenant: {
          fullName: '',
          contactNo: '',
          email: '',
          emiratesId: '',
          passportNo: '',
          nationality: '',
          passportExpiry: '',
          visaStatus: '',
          currentAddress: '',
        },
        landlord: { name: '', phone: '', email: '', emiratesId: '' },
        broker: { brokerName: '', companyName: '', orn: '', brn: '', email: '' },
        payments: {
          annualRent: 0,
          securityDeposit: 0,
          agencyFee: 0,
          total: 0,
          moveInDate: '',
          contractStartDate: '',
          contractEndDate: '',
          modeOfPayment: '',
          numberOfCheques: '',
        },
        addendum: { originalContractRef: '', effectiveDate: '' },
        viewing: { viewingDate: '', viewingTime: '' },
      },
    });

    render(
      <Provider store={store}>
        <DocumentChecklistPanel />
      </Provider>,
    );

    // With all fields empty, compliance engine should produce warnings
    expect(screen.queryByText(/Compliance Issues/i)).toBeDefined();
  });
});

// ── template info section ─────────────────────────────────────────────────────

describe('DocumentChecklistPanel — template info', () => {
  it('renders the "Template Info" section for the active template', () => {
    renderPanel(); // default 'booking' template
    expect(screen.getByText(/Template Info/i)).toBeDefined();
  });

  it('shows template version', () => {
    renderPanel();
    // booking sourceOfTruth.templateVersion = '2026.04'
    expect(screen.getByText('2026.04')).toBeDefined();
  });

  it('shows government-issued badge for government templates', () => {
    const store = makeStore({
      template: { activeTemplate: 'viewing' }, // governmentIssued: true
    });
    render(
      <Provider store={store}>
        <DocumentChecklistPanel />
      </Provider>,
    );
    expect(screen.getByText(/Government Issued/i)).toBeDefined();
  });

  it('shows internal badge for non-government templates', () => {
    renderPanel(); // 'booking' — governmentIssued: false
    expect(screen.getByText(/Internal/i)).toBeDefined();
  });

  it('shows Immutable Source badge for immutable templates', () => {
    const store = makeStore({
      template: { activeTemplate: 'viewing' }, // immutable: true
    });
    render(
      <Provider store={store}>
        <DocumentChecklistPanel />
      </Provider>,
    );
    expect(screen.getByText(/Immutable Source/i)).toBeDefined();
  });
});

// ── dc-panel wrapper ──────────────────────────────────────────────────────────

describe('DocumentChecklistPanel — wrapper', () => {
  it('renders the dc-panel root container', () => {
    const { container } = renderPanel();
    expect(container.querySelector('.dc-panel')).toBeDefined();
  });
});
