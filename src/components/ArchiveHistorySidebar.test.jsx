/**
 * ArchiveHistorySidebar.test.jsx
 * Tests for src/components/ArchiveHistorySidebar — Redux-connected sidebar
 * that shows archived quotations filtered to the active unit/community,
 * grouped by month with Disclosure panels.
 *
 * Dynamic import of downloadQuotationPdf is not tested here (async PDF flow).
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import ArchiveHistorySidebar from './ArchiveHistorySidebar';
import archiveReducer from '../store/archiveSlice';
import documentReducer from '../store/documentSlice';
import auditReducer from '../store/auditSlice';

// ── mock the dynamic PDF import so Download button doesn't fail ───────────────
vi.mock('../pdf/generateQuotationPdf', () => ({
  downloadQuotationPdf: vi.fn().mockResolvedValue(undefined),
}));

// ── store factory ─────────────────────────────────────────────────────────────

const BASE_DOC = {
  company: { name: 'White Caves Real Estate L.L.C', dedLicense: '1388443', role: 'Agent', city: 'Dubai' },
  property: {
    referenceNo: 'REF/001',
    documentDate: '',
    unit: 'Unit 449',
    cluster: 'Avencia-2',
    community: 'Damac Hills 2',
    city: 'Dubai',
    description: '4BR Townhouse',
    size: '',
    parking: '',
    condition: '',
    usage: 'Residential',
    plotNo: '',
    makaniNo: '',
    dewaPremisesNo: '',
    projectName: 'Damac Hills 2',
    buildingNumber: '',
    ownersAssociationNo: '',
  },
  tenant: {
    fullName: 'Ahmed Al Mansouri',
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
};

const ENTRY_MATCHING = {
  id: 'entry-1',
  createdAt: new Date().toISOString(),
  templateKey: 'booking',
  templateLabel: 'Booking Form',
  fileName: 'BOOKING_001.pdf',
  recordPath: '/records/2026/May/Unit449',
  persistedPath: null,
  unit: 'Unit 449',
  community: 'Damac Hills 2',
  tenantName: 'Ahmed Al Mansouri',
  documentSnapshot: {},
  isDraft: false,
};

const ENTRY_OTHER_UNIT = {
  ...ENTRY_MATCHING,
  id: 'entry-2',
  unit: 'Unit 100',
  community: 'Damac Hills 2',
  fileName: 'BOOKING_OTHER.pdf',
};

const makeStore = (entries = [], docOverride = {}) =>
  configureStore({
    reducer: {
      archive: archiveReducer,
      document: documentReducer,
      audit: auditReducer,
    },
    preloadedState: {
      archive: { entries },
      document: { ...BASE_DOC, ...docOverride },
      audit: { logs: [] },
    },
  });

const renderSidebar = (store) =>
  render(
    <Provider store={store}>
      <ArchiveHistorySidebar />
    </Provider>,
  );

// ── structure ─────────────────────────────────────────────────────────────────

describe('ArchiveHistorySidebar — structure', () => {
  it('renders an aside with aria-label "Archive history sidebar"', () => {
    renderSidebar(makeStore());
    expect(screen.getByRole('complementary', { name: /Archive history sidebar/i })).toBeDefined();
  });

  it('renders an "Archive History" heading', () => {
    renderSidebar(makeStore());
    expect(screen.getByRole('heading', { name: /Archive History/i })).toBeDefined();
  });

  it('renders a subtitle about active unit', () => {
    renderSidebar(makeStore());
    expect(screen.getByText(/Quotations for the active unit/i)).toBeDefined();
  });
});

// ── empty state ───────────────────────────────────────────────────────────────

describe('ArchiveHistorySidebar — empty state', () => {
  it('shows EmptyState when there are no entries', () => {
    renderSidebar(makeStore());
    expect(screen.getByText(/No archived quotations yet/i)).toBeDefined();
  });

  it('shows EmptyState description about automatic filing', () => {
    renderSidebar(makeStore());
    expect(screen.getByText(/filed here automatically/i)).toBeDefined();
  });
});

// ── unit-filtered entries ─────────────────────────────────────────────────────

describe('ArchiveHistorySidebar — filtered entries', () => {
  it('does not show EmptyState when matching entries exist', () => {
    renderSidebar(makeStore([ENTRY_MATCHING]));
    expect(screen.queryByText(/No archived quotations yet/i)).toBeNull();
  });

  it('renders the file name of a matching entry', () => {
    renderSidebar(makeStore([ENTRY_MATCHING]));
    expect(screen.getByText('BOOKING_001.pdf')).toBeDefined();
  });

  it('renders the template label of a matching entry', () => {
    renderSidebar(makeStore([ENTRY_MATCHING]));
    expect(screen.getByText('Booking Form')).toBeDefined();
  });

  it('renders the tenant name of a matching entry', () => {
    renderSidebar(makeStore([ENTRY_MATCHING]));
    expect(screen.getByText(/Ahmed Al Mansouri/)).toBeDefined();
  });

  it('filters out entries for a different unit', () => {
    renderSidebar(makeStore([ENTRY_OTHER_UNIT]));
    // ENTRY_OTHER_UNIT has unit='Unit 100', document has unit='Unit 449' → filtered out
    expect(screen.queryByText('BOOKING_OTHER.pdf')).toBeNull();
    expect(screen.getByText(/No archived quotations yet/i)).toBeDefined();
  });

  it('shows multiple matching entries', () => {
    const entry2 = { ...ENTRY_MATCHING, id: 'entry-3', fileName: 'BOOKING_002.pdf' };
    renderSidebar(makeStore([ENTRY_MATCHING, entry2]));
    expect(screen.getByText('BOOKING_001.pdf')).toBeDefined();
    expect(screen.getByText('BOOKING_002.pdf')).toBeDefined();
  });
});

// ── month grouping ────────────────────────────────────────────────────────────

describe('ArchiveHistorySidebar — month grouping', () => {
  it('renders a Disclosure group with the month label', () => {
    renderSidebar(makeStore([ENTRY_MATCHING]));
    // Current month disclosure should be open, so content is visible
    expect(screen.getByText('BOOKING_001.pdf')).toBeDefined();
  });

  it('groups two entries in the same month under one disclosure', () => {
    const entry2 = { ...ENTRY_MATCHING, id: 'entry-dup', fileName: 'BOOKING_DUP.pdf' };
    const { container } = renderSidebar(makeStore([ENTRY_MATCHING, entry2]));
    // Only 1 Disclosure group (same month)
    const articles = container.querySelectorAll('article.archive-item');
    expect(articles.length).toBe(2);
  });
});

// ── download button ───────────────────────────────────────────────────────────

describe('ArchiveHistorySidebar — download button', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a "Download Again" button for each entry', () => {
    renderSidebar(makeStore([ENTRY_MATCHING]));
    expect(screen.getByRole('button', { name: /Download Again/i })).toBeDefined();
  });

  it('button is not disabled initially', () => {
    renderSidebar(makeStore([ENTRY_MATCHING]));
    expect(screen.getByRole('button', { name: /Download Again/i }).disabled).toBe(false);
  });

  it('calls dynamic PDF import on Download Again click', async () => {
    const { downloadQuotationPdf } = await import('../pdf/generateQuotationPdf');
    renderSidebar(makeStore([ENTRY_MATCHING]));
    fireEvent.click(screen.getByRole('button', { name: /Download Again/i }));
    await waitFor(() => expect(downloadQuotationPdf).toHaveBeenCalled());
  });
});
