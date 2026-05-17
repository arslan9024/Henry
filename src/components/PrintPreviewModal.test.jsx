/**
 * PrintPreviewModal.test.jsx
 * Tests for src/components/PrintPreviewModal — full-screen dialog with
 * focus-trap, Escape-to-close, backdrop-click-to-close, template label
 * header, and PDF/no-PDF body branches.
 *
 * PrintButton and PrintPreview are mocked to isolate the modal's own logic.
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import PrintPreviewModal from './PrintPreviewModal';
import templateReducer from '../store/templateSlice';
import documentReducer from '../store/documentSlice';
import policyMetaReducer from '../store/policyMetaSlice';
import henryReducer from '../store/henrySlice';
import archiveReducer from '../store/archiveSlice';
import auditReducer from '../store/auditSlice';
import ocrReducer from '../store/ocrSlice';
import uiReducer from '../store/uiSlice';
import complianceReducer from '../store/complianceSlice';

// ── mock heavy sub-components ─────────────────────────────────────────────────

vi.mock('./PrintButton', () => ({
  default: () => <div data-testid="mock-print-button">PrintButton</div>,
}));

vi.mock('./PrintPreview', () => ({
  default: () => <div data-testid="mock-print-preview">PrintPreview</div>,
}));

// ── store factory ─────────────────────────────────────────────────────────────

const makeStore = (templateKey = 'booking') =>
  configureStore({
    reducer: {
      template: templateReducer,
      document: documentReducer,
      policyMeta: policyMetaReducer,
      henry: henryReducer,
      archive: archiveReducer,
      audit: auditReducer,
      ocr: ocrReducer,
      ui: uiReducer,
      compliance: complianceReducer,
    },
    preloadedState: {
      template: { activeTemplate: templateKey },
      archive: { entries: [] },
      audit: { logs: [] },
    },
  });

const renderModal = ({ isOpen = true, onClose = vi.fn(), templateKey = 'booking' } = {}) => {
  const store = makeStore(templateKey);
  return {
    onClose,
    ...render(
      <Provider store={store}>
        <PrintPreviewModal isOpen={isOpen} onClose={onClose} />
      </Provider>,
    ),
  };
};

// ── isOpen guard ──────────────────────────────────────────────────────────────

describe('PrintPreviewModal — isOpen guard', () => {
  it('renders nothing when isOpen=false', () => {
    const { container } = renderModal({ isOpen: false });
    expect(container.firstChild).toBeNull();
  });

  it('renders the dialog overlay when isOpen=true', () => {
    renderModal({ isOpen: true });
    expect(screen.getByRole('dialog')).toBeDefined();
  });
});

// ── ARIA attributes ───────────────────────────────────────────────────────────

describe('PrintPreviewModal — ARIA', () => {
  it('dialog has aria-modal="true"', () => {
    renderModal();
    expect(screen.getByRole('dialog').getAttribute('aria-modal')).toBe('true');
  });

  it('dialog has aria-label "PDF print preview"', () => {
    renderModal();
    expect(screen.getByRole('dialog').getAttribute('aria-label')).toBe('PDF print preview');
  });
});

// ── header content ────────────────────────────────────────────────────────────

describe('PrintPreviewModal — header', () => {
  it('renders an h2 with the template label', () => {
    renderModal({ templateKey: 'booking' });
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading.textContent).toContain('Booking Form');
  });

  it('shows "PDF Preview" badge for templates that support PDF', () => {
    renderModal({ templateKey: 'booking' }); // booking has supportsPdf: true
    expect(screen.getByText('PDF Preview')).toBeDefined();
  });

  it('renders a close button with aria-label "Close preview"', () => {
    renderModal();
    expect(screen.getByRole('button', { name: /Close preview/i })).toBeDefined();
  });
});

// ── close interactions ────────────────────────────────────────────────────────

describe('PrintPreviewModal — close interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls onClose when the header X button is clicked', () => {
    const onClose = vi.fn();
    renderModal({ onClose });
    fireEvent.click(screen.getByRole('button', { name: /Close preview/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when the footer Close button is clicked', () => {
    const onClose = vi.fn();
    renderModal({ onClose });
    fireEvent.click(screen.getByRole('button', { name: /^✕ Close$/ }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when Escape key is pressed', () => {
    const onClose = vi.fn();
    renderModal({ onClose });
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when the overlay backdrop is clicked', () => {
    const onClose = vi.fn();
    renderModal({ onClose });
    const overlay = screen.getByRole('dialog');
    // Simulate click directly on overlay (e.target === e.currentTarget)
    fireEvent.click(overlay, { target: overlay });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not call onClose when clicking inside the panel', () => {
    const onClose = vi.fn();
    renderModal({ onClose });
    // Click the heading inside ppm-panel (not the backdrop)
    fireEvent.click(screen.getByRole('heading', { level: 2 }));
    expect(onClose).not.toHaveBeenCalled();
  });
});

// ── body content ──────────────────────────────────────────────────────────────

describe('PrintPreviewModal — body', () => {
  it('renders the (mocked) PrintPreview when template supports PDF', () => {
    renderModal({ templateKey: 'booking' }); // supportsPdf: true
    expect(screen.getByTestId('mock-print-preview')).toBeDefined();
  });

  it('renders the (mocked) PrintButton in the footer', () => {
    renderModal();
    expect(screen.getByTestId('mock-print-button')).toBeDefined();
  });
});
