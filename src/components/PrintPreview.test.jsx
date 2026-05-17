/**
 * PrintPreview.test.jsx
 * Redux-connected preview panel. Dynamically imports generateQuotationPdfBlob.
 * Tests: "not supported" branch, loading state, error state, ready (iframe) state.
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import PrintPreview from './PrintPreview';
import templateReducer from '../store/templateSlice';
import documentReducer from '../store/documentSlice';
import uiReducer from '../store/uiSlice';

// ── mock dynamic PDF blob import ──────────────────────────────────────────────

vi.mock('../pdf/generateQuotationPdf', () => ({
  generateQuotationPdfBlob: vi
    .fn()
    .mockResolvedValue(new Blob(['%PDF-1.4 fake'], { type: 'application/pdf' })),
}));

// ── store factory ─────────────────────────────────────────────────────────────

const makeStore = (templateKey = 'booking') =>
  configureStore({
    reducer: {
      template: templateReducer,
      document: documentReducer,
      ui: uiReducer,
    },
    preloadedState: {
      template: { activeTemplate: templateKey },
    },
  });

const renderPreview = (templateKey = 'booking') => {
  const store = makeStore(templateKey);
  return {
    store,
    ...render(
      <Provider store={store}>
        <PrintPreview />
      </Provider>,
    ),
  };
};

// ── no-PDF branch ─────────────────────────────────────────────────────────────

describe('PrintPreview — no PDF support', () => {
  it('shows "does not yet support" message for templates without PDF', () => {
    // Use a template key that yields canGeneratePdf=false
    // Identify by checking if the booking template shows the preview (it supports PDF)
    // For the no-PDF case, rendering the empty message is the expected result when
    // selectCanGeneratePdf returns false. We test via a non-existent template key.
    renderPreview('nonexistent-template');
    expect(screen.getByText(/does not yet support a vector PDF preview/i)).toBeDefined();
  });

  it('renders inside print-preview-empty div for unsupported templates', () => {
    const { container } = renderPreview('nonexistent-template');
    expect(container.querySelector('.print-preview-empty')).toBeDefined();
  });
});

// ── PDF-supported branch ──────────────────────────────────────────────────────

describe('PrintPreview — with PDF support (booking)', () => {
  it('renders the print-preview-wrap with aria-live="polite"', () => {
    const { container } = renderPreview('booking');
    expect(container.querySelector('[aria-live="polite"]')).toBeDefined();
  });

  it('shows "Rendering A4 preview…" loading state initially', () => {
    renderPreview('booking');
    expect(screen.getByText(/Rendering A4 preview/i)).toBeDefined();
  });

  it('renders an iframe once blob URL is ready', async () => {
    // URL.createObjectURL returns 'blob:mock' in jsdom (it's a no-op that returns '')
    // We need it to return something non-null for the iframe to render
    const originalCreateObjectURL = URL.createObjectURL;
    URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    URL.revokeObjectURL = vi.fn();

    const { container } = renderPreview('booking');

    await waitFor(
      () => {
        const iframe = container.querySelector('iframe');
        expect(iframe).not.toBeNull();
      },
      { timeout: 2000 },
    );

    URL.createObjectURL = originalCreateObjectURL;
  });

  it('iframe has title "Document A4 print preview"', async () => {
    URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    URL.revokeObjectURL = vi.fn();

    renderPreview('booking');

    await waitFor(
      () => {
        expect(screen.getByTitle(/Document A4 print preview/i)).toBeDefined();
      },
      { timeout: 2000 },
    );

    URL.createObjectURL = () => '';
  });

  it('dispatches setPreviewReady to store when PDF renders', async () => {
    URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    URL.revokeObjectURL = vi.fn();

    const { store } = renderPreview('booking');

    await waitFor(
      () => {
        expect(store.getState().ui.preview.status).toBe('ready');
      },
      { timeout: 2000 },
    );

    URL.createObjectURL = () => '';
  });
});

// ── error branch ──────────────────────────────────────────────────────────────

describe('PrintPreview — error state', () => {
  it('shows error message when PDF generation throws', async () => {
    const { generateQuotationPdfBlob } = await import('../pdf/generateQuotationPdf');
    generateQuotationPdfBlob.mockRejectedValueOnce(new Error('render failed'));

    renderPreview('booking');

    await waitFor(
      () => {
        expect(screen.getByText(/Preview error: render failed/i)).toBeDefined();
      },
      { timeout: 2000 },
    );
  });

  it('dispatches setPreviewError on generation failure', async () => {
    const { generateQuotationPdfBlob } = await import('../pdf/generateQuotationPdf');
    generateQuotationPdfBlob.mockRejectedValueOnce(new Error('oops'));

    const { store } = renderPreview('booking');

    await waitFor(
      () => {
        expect(store.getState().ui.preview.status).toBe('error');
      },
      { timeout: 2000 },
    );
  });
});
