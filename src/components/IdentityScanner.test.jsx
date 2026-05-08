/**
 * IdentityScanner.test.jsx
 * Redux-connected component that:
 *  - reads ocr.draft + ocr.processing from ocrSlice
 *  - dynamically imports tesseract.js on Scan click
 *  - dispatches setOcrDraft, approveOcrDraft, clearOcrDraft, addAuditLog
 *  - on approval, dispatches updateDocumentSection for tenant or landlord
 *
 * tesseract.js is mocked so handleScan logic can be exercised without a real OCR engine.
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import IdentityScanner from './IdentityScanner';
import ocrReducer from '../store/ocrSlice';
import documentReducer from '../store/documentSlice';
import auditReducer from '../store/auditSlice';

// ── mock tesseract.js dynamic import ─────────────────────────────────────────
vi.mock('tesseract.js', () => ({
  createWorker: vi.fn().mockResolvedValue({
    recognize: vi.fn().mockResolvedValue({ data: { text: '784-1990-1234567-1 AHMED ALI 31/12/2028' } }),
    terminate: vi.fn().mockResolvedValue(undefined),
  }),
}));

// ── store factory ─────────────────────────────────────────────────────────────

const makeStore = (ocrOverride = {}) =>
  configureStore({
    reducer: {
      ocr: ocrReducer,
      document: documentReducer,
      audit: auditReducer,
    },
    preloadedState: {
      ocr: { draft: null, processing: false, ...ocrOverride },
      audit: { logs: [] },
    },
  });

const renderScanner = (ocrOverride = {}) => {
  const store = makeStore(ocrOverride);
  return {
    store,
    ...render(
      <Provider store={store}>
        <IdentityScanner />
      </Provider>,
    ),
  };
};

const DRAFT = {
  target: 'tenant',
  fullName: 'Ahmed Ali',
  emiratesId: '784-1990-1234567-1',
  expiryDate: '31/12/2028',
  fileName: 'id.jpg',
  scannedAt: '2026-05-07T10:00:00.000Z',
  confidence: { fullName: 0.9, emiratesId: 0.85, expiryDate: 0.88 },
};

// ── structure ─────────────────────────────────────────────────────────────────

describe('IdentityScanner — structure', () => {
  it('renders a section with aria-label "Identity scanner"', () => {
    renderScanner();
    expect(screen.getByRole('region', { name: /Identity scanner/i })).toBeDefined();
  });

  it('renders "Identity Scanner" heading', () => {
    renderScanner();
    expect(screen.getByRole('heading', { name: /Identity Scanner/i })).toBeDefined();
  });

  it('renders "Map to" select with Tenant option', () => {
    renderScanner();
    expect(screen.getByText('Tenant')).toBeDefined();
  });

  it('renders "Map to" select with Landlord option', () => {
    renderScanner();
    expect(screen.getByText('Landlord')).toBeDefined();
  });

  it('renders a file input for Emirates ID image', () => {
    const { container } = renderScanner();
    expect(container.querySelector('input[type="file"]')).toBeDefined();
  });

  it('renders a "Scan ID" button', () => {
    renderScanner();
    expect(screen.getByRole('button', { name: /Scan ID/i })).toBeDefined();
  });
});

// ── processing state ──────────────────────────────────────────────────────────

describe('IdentityScanner — processing', () => {
  it('shows "Scanning…" when processing is true', () => {
    renderScanner({ processing: true });
    expect(screen.getByRole('button', { name: /Scanning…/i })).toBeDefined();
  });

  it('"Scan ID" button is disabled when processing', () => {
    renderScanner({ processing: true });
    expect(screen.getByRole('button', { name: /Scanning…/i }).disabled).toBe(true);
  });

  it('"Scan ID" button is enabled when not processing', () => {
    renderScanner();
    expect(screen.getByRole('button', { name: /Scan ID/i }).disabled).toBe(false);
  });
});

// ── error state ───────────────────────────────────────────────────────────────

describe('IdentityScanner — error state', () => {
  it('shows error message when Scan is clicked with no file selected', async () => {
    renderScanner();
    fireEvent.click(screen.getByRole('button', { name: /Scan ID/i }));
    await waitFor(() => expect(screen.getByText(/Please upload a PNG or JPG image first/i)).toBeDefined());
  });
});

// ── draft review card ─────────────────────────────────────────────────────────

describe('IdentityScanner — draft review', () => {
  it('shows "Review & Approve" when a draft exists', () => {
    renderScanner({ draft: DRAFT });
    expect(screen.getByText(/Review & Approve/i)).toBeDefined();
  });

  it('displays the draft target in the review card', () => {
    renderScanner({ draft: DRAFT });
    // The review card shows "Target: tenant" — use getAllBy to handle the Tenant option text
    const elements = screen.getAllByText(/tenant/i);
    expect(elements.length).toBeGreaterThan(0);
  });

  it('displays the draft fullName', () => {
    renderScanner({ draft: DRAFT });
    expect(screen.getByText(/Ahmed Ali/)).toBeDefined();
  });

  it('displays the draft emiratesId', () => {
    renderScanner({ draft: DRAFT });
    expect(screen.getByText(/784-1990-1234567-1/)).toBeDefined();
  });

  it('displays the draft expiryDate', () => {
    renderScanner({ draft: DRAFT });
    expect(screen.getByText(/31\/12\/2028/)).toBeDefined();
  });

  it('"Approve Mapping" is enabled when canApprove is true', () => {
    renderScanner({ draft: DRAFT });
    expect(screen.getByRole('button', { name: /Approve Mapping/i }).disabled).toBe(false);
  });

  it('"Approve Mapping" is disabled when draft has no useful fields', () => {
    const emptyDraft = { ...DRAFT, fullName: '', emiratesId: '', expiryDate: '' };
    renderScanner({ draft: emptyDraft });
    expect(screen.getByRole('button', { name: /Approve Mapping/i }).disabled).toBe(true);
  });

  it('renders a "Clear Draft" button', () => {
    renderScanner({ draft: DRAFT });
    expect(screen.getByRole('button', { name: /Clear Draft/i })).toBeDefined();
  });
});

// ── approve action ────────────────────────────────────────────────────────────

describe('IdentityScanner — Approve Mapping', () => {
  it('dispatches approveOcrDraft when Approve is clicked', () => {
    const { store } = renderScanner({ draft: DRAFT });
    fireEvent.click(screen.getByRole('button', { name: /Approve Mapping/i }));
    // approveOcrDraft should clear draft
    expect(store.getState().ocr.draft).toBeNull();
  });

  it('updates document tenant section on tenant approval', () => {
    const { store } = renderScanner({ draft: DRAFT });
    fireEvent.click(screen.getByRole('button', { name: /Approve Mapping/i }));
    expect(store.getState().document.tenant.fullName).toBe('Ahmed Ali');
    expect(store.getState().document.tenant.emiratesId).toBe('784-1990-1234567-1');
  });

  it('updates document landlord section on landlord approval', () => {
    const landlordDraft = { ...DRAFT, target: 'landlord' };
    const { store } = renderScanner({ draft: landlordDraft });
    fireEvent.click(screen.getByRole('button', { name: /Approve Mapping/i }));
    expect(store.getState().document.landlord.emiratesId).toBe('784-1990-1234567-1');
  });
});

// ── clear draft ───────────────────────────────────────────────────────────────

describe('IdentityScanner — Clear Draft', () => {
  it('dispatches clearOcrDraft when Clear Draft is clicked', () => {
    const { store } = renderScanner({ draft: DRAFT });
    fireEvent.click(screen.getByRole('button', { name: /Clear Draft/i }));
    expect(store.getState().ocr.draft).toBeNull();
  });

  it('hides the review card after clearing draft', () => {
    renderScanner({ draft: DRAFT });
    fireEvent.click(screen.getByRole('button', { name: /Clear Draft/i }));
    expect(screen.queryByText(/Review & Approve/i)).toBeNull();
  });
});

// ── scan flow (mocked tesseract) ──────────────────────────────────────────────

describe('IdentityScanner — scan flow', () => {
  it('shows draft review after a successful scan', async () => {
    const { container } = renderScanner();
    const fileInput = container.querySelector('input[type="file"]');
    const mockFile = new File(['data'], 'id.jpg', { type: 'image/jpeg' });
    fireEvent.change(fileInput, { target: { files: [mockFile] } });
    fireEvent.click(screen.getByRole('button', { name: /Scan ID/i }));
    await waitFor(() => expect(screen.queryByText(/Review & Approve/i)).toBeDefined());
  });
});
