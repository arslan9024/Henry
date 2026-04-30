import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import React from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Print Preview Integration Test Suite
//
// Tests the full print/PDF export workflow including:
// • PrintButton UI state (enabled/disabled)
// • PrintPreview lifecycle (rendering → ready | error)
// • Redux preview state transitions
// • Audit log dispatch on print actions
// • Archive entry creation on PDF generation
// • Toast notifications for success/failure
// • Draft saving workflow
// ─────────────────────────────────────────────────────────────────────────────

// Mock window.print
window.print = vi.fn();

// Mock the PDF generation module
vi.mock('../pdf/generateQuotationPdf', () => ({
  downloadQuotationPdf: vi.fn(),
  generateQuotationPdfBlob: vi.fn(),
}));

// Mock the records service
vi.mock('../records/archiveService', () => ({
  persistRecordFile: vi.fn(),
  loadArchiveEntries: vi.fn(() => []),
  persistArchiveEntries: vi.fn(),
}));

// Mock the path builder
vi.mock('../records/pathBuilder', () => ({
  buildLogicalRecordPath: vi.fn(),
}));

import PrintButton from './PrintButton';
import PrintPreview from './PrintPreview';
import documentSliceReducer from '../store/documentSlice';
import templateSliceReducer from '../store/templateSlice';
import auditSliceReducer from '../store/auditSlice';
import archiveSliceReducer from '../store/archiveSlice';
import complianceSliceReducer from '../store/complianceSlice';
import policyMetaSliceReducer from '../store/policyMetaSlice';
import sidebarSliceReducer from '../store/sidebarSlice';
import uiSliceReducer from '../store/uiSlice';
import { downloadQuotationPdf, generateQuotationPdfBlob } from '../pdf/generateQuotationPdf';
import * as archiveService from '../records/archiveService';
import { buildLogicalRecordPath } from '../records/pathBuilder';

const createTestStore = (initialState = {}) => {
  const defaultState = {
    document: initialState.document || {
      company: {
        name: 'White Caves Real Estate L.L.C',
        dedLicense: '1388443',
        role: 'Authorized Property Leasing Agent',
        city: 'Dubai',
      },
      property: {
        unit: 'PH-101',
        community: 'Dubai Marina',
        description: '2 Bedroom Apartment',
      },
      tenant: { fullName: 'John Doe' },
    },
    template: initialState.template || {
      activeTemplate: 'booking',
      templates: {},
    },
    audit: initialState.audit || { logs: [] },
    archive: initialState.archive || { entries: [] },
    compliance: initialState.compliance || { checks: [] },
    policyMeta: initialState.policyMeta || { version: '1.0.0' },
    sidebar: initialState.sidebar || { visible: true },
    ui: initialState.ui || {
      toasts: [],
      save: { status: 'idle', dirtyAt: null, lastSavedAt: null },
      preview: { status: 'idle', lastRenderedAt: null },
    },
  };

  return configureStore({
    reducer: {
      document: documentSliceReducer,
      template: templateSliceReducer,
      audit: auditSliceReducer,
      archive: archiveSliceReducer,
      compliance: complianceSliceReducer,
      policyMeta: policyMetaSliceReducer,
      sidebar: sidebarSliceReducer,
      ui: uiSliceReducer,
    },
    preloadedState: defaultState,
  });
};

const TestWrapper = ({ store, children }) => <Provider store={store}>{children}</Provider>;

describe('DocumentHubPage.printPreview — print/PDF export integration', () => {
  let store;

  beforeEach(() => {
    vi.clearAllMocks();
    // Ensure default mocks are set up so tests don't interfere with each other
    vi.spyOn(archiveService, 'persistRecordFile').mockResolvedValue({ ok: false });
    downloadQuotationPdf.mockResolvedValue({ fileName: '', blob: new Blob() });
    generateQuotationPdfBlob.mockResolvedValue(new Blob());
    buildLogicalRecordPath.mockReturnValue('records/path');
    store = createTestStore();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Print Button State & Visibility
  // ───────────────────────────────────────────────────────────────────────────

  it('renders PrintButton with all three action buttons visible', () => {
    render(
      <TestWrapper store={store}>
        <PrintButton />
      </TestWrapper>,
    );

    expect(screen.getByLabelText('Save a draft snapshot to the archive')).toBeInTheDocument();
    expect(screen.getByLabelText('Generate high-quality quotation PDF')).toBeInTheDocument();
    expect(screen.getByLabelText('Print selected document to PDF')).toBeInTheDocument();
  });

  it('shows "Ready to print: Booking Form (Standard Leasing)" template label', () => {
    render(
      <TestWrapper store={store}>
        <PrintButton />
      </TestWrapper>,
    );

    expect(screen.getByText(/Ready to print:/)).toBeInTheDocument();
    expect(screen.getByText(/Booking Form \(Standard Leasing\)/)).toBeInTheDocument();
  });

  it('disables Generate PDF button when preview is not ready', () => {
    store = createTestStore({
      ui: {
        toasts: [],
        save: { status: 'idle', dirtyAt: null, lastSavedAt: null },
        preview: { status: 'rendering', lastRenderedAt: null }, // rendering state
      },
    });

    render(
      <TestWrapper store={store}>
        <PrintButton />
      </TestWrapper>,
    );

    const pdfButton = screen.getByLabelText('Generate high-quality quotation PDF');
    expect(pdfButton).toBeDisabled();
  });

  it('enables Generate PDF button when preview is ready', () => {
    store = createTestStore({
      ui: {
        toasts: [],
        save: { status: 'idle', dirtyAt: null, lastSavedAt: null },
        preview: { status: 'ready', lastRenderedAt: Date.now() }, // ready state
      },
    });

    render(
      <TestWrapper store={store}>
        <PrintButton />
      </TestWrapper>,
    );

    const pdfButton = screen.getByLabelText('Generate high-quality quotation PDF');
    expect(pdfButton).not.toBeDisabled();
  });

  it('shows stale preview hint when preview status is rendering', () => {
    store = createTestStore({
      ui: {
        toasts: [],
        save: { status: 'idle', dirtyAt: null, lastSavedAt: null },
        preview: { status: 'rendering', lastRenderedAt: null },
      },
    });

    render(
      <TestWrapper store={store}>
        <PrintButton />
      </TestWrapper>,
    );

    expect(screen.getByText(/Preview updating/)).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/Preview updating/);
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Draft Saving Workflow
  // ───────────────────────────────────────────────────────────────────────────

  it('saves draft to archive on "Save Draft" button click', async () => {
    render(
      <TestWrapper store={store}>
        <PrintButton />
      </TestWrapper>,
    );

    const draftButton = screen.getByLabelText('Save a draft snapshot to the archive');

    await act(async () => {
      fireEvent.click(draftButton);
      // Wait for async state updates
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    const state = store.getState();
    const draftEntry = state.archive.entries.find((e) => e.isDraft === true);

    expect(draftEntry).toBeDefined();
    expect(draftEntry.templateLabel).toContain('Draft');
    expect(draftEntry.unit).toBe('PH-101');
    expect(draftEntry.community).toBe('Dubai Marina');
  });

  it('dispatches audit log when draft is saved', async () => {
    render(
      <TestWrapper store={store}>
        <PrintButton />
      </TestWrapper>,
    );

    const draftButton = screen.getByLabelText('Save a draft snapshot to the archive');

    await act(async () => {
      fireEvent.click(draftButton);
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    const state = store.getState();
    const auditLog = state.audit.logs.find((log) => log.type === 'DRAFT_SAVED');

    expect(auditLog).toBeDefined();
    expect(auditLog.template).toBe('booking');
    expect(auditLog.policyVersion).toBe('1.0.0');
  });

  it('shows success toast when draft is saved', async () => {
    render(
      <TestWrapper store={store}>
        <PrintButton />
      </TestWrapper>,
    );

    const draftButton = screen.getByLabelText('Save a draft snapshot to the archive');

    await act(async () => {
      fireEvent.click(draftButton);
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    const state = store.getState();
    const toast = state.ui.toasts.find((t) => t.title === 'Draft saved');

    expect(toast).toBeDefined();
    expect(toast.tone).toBe('success');
    expect(toast.body).toContain('draft recorded');
  });

  // ───────────────────────────────────────────────────────────────────────────
  // PDF Generation Workflow
  // ───────────────────────────────────────────────────────────────────────────

  it('generates PDF and creates archive entry on button click', async () => {
    const mockBlob = new Blob(['mock pdf'], { type: 'application/pdf' });
    downloadQuotationPdf.mockResolvedValueOnce({
      fileName: 'BookingForm_2024-01-15.pdf',
      blob: mockBlob,
    });
    vi.spyOn(archiveService, 'persistRecordFile').mockResolvedValueOnce({
      ok: true,
      path: 'records/2024/01/PH-101/BookingForm_2024-01-15.pdf',
    });
    buildLogicalRecordPath.mockReturnValueOnce('records/2024/01/PH-101');

    store = createTestStore({
      ui: {
        toasts: [],
        save: { status: 'idle', dirtyAt: null, lastSavedAt: null },
        preview: { status: 'ready', lastRenderedAt: Date.now() },
      },
    });

    render(
      <TestWrapper store={store}>
        <PrintButton />
      </TestWrapper>,
    );

    const pdfButton = screen.getByLabelText('Generate high-quality quotation PDF');

    await act(async () => {
      fireEvent.click(pdfButton);
      // Wait for async operations
      await waitFor(() => {
        const state = store.getState();
        return state.archive.entries.length > 0;
      });
    });

    expect(downloadQuotationPdf).toHaveBeenCalledOnce();
    expect(archiveService.persistRecordFile).toHaveBeenCalledOnce();

    const state = store.getState();
    const pdfEntry = state.archive.entries[0];

    expect(pdfEntry.fileName).toBe('BookingForm_2024-01-15.pdf');
    expect(pdfEntry.persistedPath).toBe('records/2024/01/PH-101/BookingForm_2024-01-15.pdf');
  });

  it('dispatches audit log when PDF is generated', async () => {
    const mockBlob = new Blob(['mock pdf'], { type: 'application/pdf' });
    downloadQuotationPdf.mockResolvedValueOnce({
      fileName: 'BookingForm_2024-01-15.pdf',
      blob: mockBlob,
    });
    vi.spyOn(archiveService, 'persistRecordFile').mockResolvedValueOnce({
      ok: true,
      path: 'records/2024/01/PH-101/BookingForm_2024-01-15.pdf',
    });
    buildLogicalRecordPath.mockReturnValueOnce('records/2024/01/PH-101');

    store = createTestStore({
      ui: {
        toasts: [],
        save: { status: 'idle', dirtyAt: null, lastSavedAt: null },
        preview: { status: 'ready', lastRenderedAt: Date.now() },
      },
    });

    render(
      <TestWrapper store={store}>
        <PrintButton />
      </TestWrapper>,
    );

    const pdfButton = screen.getByLabelText('Generate high-quality quotation PDF');

    await act(async () => {
      fireEvent.click(pdfButton);
      await waitFor(() => {
        const state = store.getState();
        return state.audit.logs.some((log) => log.type === 'PDF_GENERATED');
      });
    });

    const state = store.getState();
    const auditLog = state.audit.logs.find((log) => log.type === 'PDF_GENERATED');

    expect(auditLog).toBeDefined();
    expect(auditLog.fileName).toBe('BookingForm_2024-01-15.pdf');
    expect(auditLog.persisted).toBe('records/2024/01/PH-101/BookingForm_2024-01-15.pdf');
  });

  it('shows success toast when PDF is persisted', async () => {
    const mockBlob = new Blob(['mock pdf'], { type: 'application/pdf' });
    downloadQuotationPdf.mockResolvedValueOnce({
      fileName: 'BookingForm_2024-01-15.pdf',
      blob: mockBlob,
    });
    vi.spyOn(archiveService, 'persistRecordFile').mockResolvedValueOnce({
      ok: true,
      path: 'records/2024/01/PH-101/BookingForm_2024-01-15.pdf',
    });
    buildLogicalRecordPath.mockReturnValueOnce('records/2024/01/PH-101');

    store = createTestStore({
      ui: {
        toasts: [],
        save: { status: 'idle', dirtyAt: null, lastSavedAt: null },
        preview: { status: 'ready', lastRenderedAt: Date.now() },
      },
    });

    render(
      <TestWrapper store={store}>
        <PrintButton />
      </TestWrapper>,
    );

    const pdfButton = screen.getByLabelText('Generate high-quality quotation PDF');

    await act(async () => {
      fireEvent.click(pdfButton);
      await waitFor(() => {
        const state = store.getState();
        return state.ui.toasts.some((t) => t.title === 'PDF generated');
      });
    });

    const state = store.getState();
    const toast = state.ui.toasts.find((t) => t.title === 'PDF generated');

    expect(toast).toBeDefined();
    expect(toast.tone).toBe('success');
    expect(toast.body).toContain('saved to');
  });

  it('shows warning toast when PDF generates but persistence fails', async () => {
    const mockBlob = new Blob(['mock pdf'], { type: 'application/pdf' });
    downloadQuotationPdf.mockResolvedValueOnce({
      fileName: 'BookingForm_2024-01-15.pdf',
      blob: mockBlob,
    });
    vi.spyOn(archiveService, 'persistRecordFile').mockResolvedValueOnce({
      ok: false,
      error: 'Filesystem write skipped',
    });
    buildLogicalRecordPath.mockReturnValueOnce('records/2024/01/PH-101');

    store = createTestStore({
      ui: {
        toasts: [],
        save: { status: 'idle', dirtyAt: null, lastSavedAt: null },
        preview: { status: 'ready', lastRenderedAt: Date.now() },
      },
    });

    render(
      <TestWrapper store={store}>
        <PrintButton />
      </TestWrapper>,
    );

    const pdfButton = screen.getByLabelText('Generate high-quality quotation PDF');

    await act(async () => {
      fireEvent.click(pdfButton);
      await waitFor(() => {
        const state = store.getState();
        return state.ui.toasts.some((t) => t.title === 'PDF generated (not archived)');
      });
    });

    const state = store.getState();
    const toast = state.ui.toasts.find((t) => t.title === 'PDF generated (not archived)');

    expect(toast).toBeDefined();
    expect(toast.tone).toBe('warning');
    expect(toast.body).toContain('filesystem write skipped');
  });

  it('disables PDF button while generating', async () => {
    const mockBlob = new Blob(['mock pdf'], { type: 'application/pdf' });

    // Make the promise slow so we can catch the loading state
    let resolve;
    const slowPromise = new Promise((r) => {
      resolve = r;
    });

    downloadQuotationPdf.mockReturnValue(
      new Promise((r) => {
        slowPromise.then(() =>
          r({
            fileName: 'BookingForm_2024-01-15.pdf',
            blob: mockBlob,
          }),
        );
      }),
    );

    store = createTestStore({
      ui: {
        toasts: [],
        save: { status: 'idle', dirtyAt: null, lastSavedAt: null },
        preview: { status: 'ready', lastRenderedAt: Date.now() },
      },
    });

    render(
      <TestWrapper store={store}>
        <PrintButton />
      </TestWrapper>,
    );

    const pdfButton = screen.getByLabelText('Generate high-quality quotation PDF');

    await act(async () => {
      fireEvent.click(pdfButton);
    });

    // Button should be disabled while generating
    expect(pdfButton).toBeDisabled();

    // Cleanup
    resolve();
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Print Preview State Transitions
  // ───────────────────────────────────────────────────────────────────────────

  it('renders PrintPreview component without errors', () => {
    generateQuotationPdfBlob.mockImplementation(() => Promise.resolve(new Blob([])));

    store = createTestStore({
      ui: {
        toasts: [],
        save: { status: 'idle', dirtyAt: null, lastSavedAt: null },
        preview: { status: 'idle', lastRenderedAt: null },
      },
    });

    // Should render without throwing
    const { container } = render(
      <TestWrapper store={store}>
        <PrintPreview />
      </TestWrapper>,
    );

    expect(container.querySelector('.print-preview-wrap')).toBeInTheDocument();
  });

  it('renders PrintPreview empty message when template does not support PDF', () => {
    store = createTestStore({
      template: {
        activeTemplateKey: 'ViewingForm',
        templates: {
          ViewingForm: {
            id: 'ViewingForm',
            name: 'Viewing Form',
            label: 'Viewing Form',
            // no canGeneratePdf flag
          },
        },
      },
    });

    render(
      <TestWrapper store={store}>
        <PrintPreview />
      </TestWrapper>,
    );

    expect(screen.getByText(/does not yet support/)).toBeInTheDocument();
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Legacy Print Action
  // ───────────────────────────────────────────────────────────────────────────

  it('dispatches audit log when Legacy Print button is clicked', async () => {
    render(
      <TestWrapper store={store}>
        <PrintButton />
      </TestWrapper>,
    );

    const printButton = screen.getByLabelText('Print selected document to PDF');

    await act(async () => {
      fireEvent.click(printButton);
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    const state = store.getState();
    const auditLog = state.audit.logs.find((log) => log.type === 'PRINT');

    expect(auditLog).toBeDefined();
    expect(auditLog.template).toBe('booking');
    expect(auditLog.policyVersion).toBe('1.0.0');
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Error Handling
  // ───────────────────────────────────────────────────────────────────────────

  it('handles PDF generation errors gracefully', async () => {
    // This test intentionally triggers a rejected promise to test error handling
    // We suppress the unhandled rejection warning since we're testing the error path
    const unhandledRejectionHandler = (event) => {
      if (event.reason?.message === 'PDF generation failed') {
        event.preventDefault();
      }
    };

    window.addEventListener('unhandledrejection', unhandledRejectionHandler);

    try {
      downloadQuotationPdf.mockRejectedValueOnce(new Error('PDF generation failed'));

      store = createTestStore({
        ui: {
          toasts: [],
          save: { status: 'idle', dirtyAt: null, lastSavedAt: null },
          preview: { status: 'ready', lastRenderedAt: Date.now() },
        },
      });

      render(
        <TestWrapper store={store}>
          <PrintButton />
        </TestWrapper>,
      );

      const pdfButton = screen.getByLabelText('Generate high-quality quotation PDF');

      // Suppress error console output for this test
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      try {
        // Should not throw
        await act(async () => {
          fireEvent.click(pdfButton);
          await new Promise((resolve) => setTimeout(resolve, 100));
        });

        // Button should be re-enabled after error
        expect(pdfButton).not.toBeDisabled();
      } finally {
        consoleErrorSpy.mockRestore();
      }
    } finally {
      window.removeEventListener('unhandledrejection', unhandledRejectionHandler);
    }
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Multi-Action Scenarios
  // ───────────────────────────────────────────────────────────────────────────

  it('allows draft save followed by PDF generation in sequence', async () => {
    const mockBlob = new Blob(['mock pdf'], { type: 'application/pdf' });
    downloadQuotationPdf.mockResolvedValueOnce({
      fileName: 'BookingForm_2024-01-15.pdf',
      blob: mockBlob,
    });
    vi.spyOn(archiveService, 'persistRecordFile').mockResolvedValueOnce({
      ok: true,
      path: 'records/2024/01/PH-101/BookingForm_2024-01-15.pdf',
    });
    buildLogicalRecordPath.mockReturnValueOnce('records/2024/01/PH-101');

    store = createTestStore({
      ui: {
        toasts: [],
        save: { status: 'idle', dirtyAt: null, lastSavedAt: null },
        preview: { status: 'ready', lastRenderedAt: Date.now() },
      },
    });

    render(
      <TestWrapper store={store}>
        <PrintButton />
      </TestWrapper>,
    );

    // First: Save draft
    const draftButton = screen.getByLabelText('Save a draft snapshot to the archive');
    await act(async () => {
      fireEvent.click(draftButton);
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    let state = store.getState();
    expect(state.archive.entries).toHaveLength(1);
    expect(state.archive.entries[0].isDraft).toBe(true);

    // Second: Generate PDF
    const pdfButton = screen.getByLabelText('Generate high-quality quotation PDF');
    await act(async () => {
      fireEvent.click(pdfButton);
      await waitFor(() => {
        const s = store.getState();
        return s.archive.entries.length > 1;
      });
    });

    state = store.getState();
    expect(state.archive.entries).toHaveLength(2);

    const pdfEntry = state.archive.entries.find((e) => !e.isDraft);
    expect(pdfEntry.fileName).toBe('BookingForm_2024-01-15.pdf');
  });

  it('generates two separate PDFs for two consecutive clicks', async () => {
    const mockBlob = new Blob(['mock pdf'], { type: 'application/pdf' });
    downloadQuotationPdf
      .mockResolvedValueOnce({
        fileName: 'BookingForm_2024-01-15_v1.pdf',
        blob: mockBlob,
      })
      .mockResolvedValueOnce({
        fileName: 'BookingForm_2024-01-15_v2.pdf',
        blob: mockBlob,
      });

    const persistSpy = vi.spyOn(archiveService, 'persistRecordFile');
    persistSpy
      .mockResolvedValueOnce({
        ok: true,
        path: 'records/2024/01/PH-101/BookingForm_2024-01-15_v1.pdf',
      })
      .mockResolvedValueOnce({
        ok: true,
        path: 'records/2024/01/PH-101/BookingForm_2024-01-15_v2.pdf',
      });

    buildLogicalRecordPath.mockReturnValue('records/2024/01/PH-101');

    store = createTestStore({
      ui: {
        toasts: [],
        save: { status: 'idle', dirtyAt: null, lastSavedAt: null },
        preview: { status: 'ready', lastRenderedAt: Date.now() },
      },
    });

    render(
      <TestWrapper store={store}>
        <PrintButton />
      </TestWrapper>,
    );

    const pdfButton = screen.getByLabelText('Generate high-quality quotation PDF');

    // First click
    await act(async () => {
      fireEvent.click(pdfButton);
      await waitFor(() => {
        const state = store.getState();
        return state.archive.entries.length === 1;
      });
    });

    // Second click
    await act(async () => {
      fireEvent.click(pdfButton);
      await waitFor(() => {
        const state = store.getState();
        return state.archive.entries.length === 2;
      });
    });

    const state = store.getState();
    expect(state.archive.entries).toHaveLength(2);
    // Entries are added with unshift(), so newest is first
    expect(state.archive.entries[0].fileName).toBe('BookingForm_2024-01-15_v2.pdf');
    expect(state.archive.entries[1].fileName).toBe('BookingForm_2024-01-15_v1.pdf');
  });
});
