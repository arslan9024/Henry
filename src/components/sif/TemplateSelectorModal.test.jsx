/**
 * TemplateSelectorModal.test.jsx
 * Tests for the SIF TemplateSelectorModal component.
 *
 * Behaviour:
 *   - Returns null when isOpen=false
 *   - Renders heading, search input, close button, footer when open
 *   - Shows empty-state message when store has no templates
 *   - Shows "No templates match" when search has no results
 *   - Renders TemplateCard for each template when no search query
 *   - Filters templates by name, organizationName, employerOrgNo
 *   - Footer shows "N of M templates" count
 *   - Clicking the ✕ close button calls onClose
 *   - Clicking the footer Close button calls onClose
 *   - Clicking the overlay calls onClose
 *   - Clicking inside the modal does NOT call onClose (stopPropagation)
 */
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import payrollReducer from '../../store/payrollSlice';
import TemplateSelectorModal from './TemplateSelectorModal';

// ── store factory ─────────────────────────────────────────────────────────────

const makeStore = (templates = []) =>
  configureStore({
    reducer: { payroll: payrollReducer },
    preloadedState: {
      payroll: {
        templates,
        history: [],
        currentFile: {
          templateId: null,
          templateName: '',
          companyInfo: {
            employerOrgNo: '',
            organizationName: '',
            bankCode: '',
            routingCode: '',
            accountNumber: '',
            iban: '',
            accountHolderName: '',
            email: '',
            phone: '',
          },
          employees: [],
          validationErrors: [],
          metadata: { createdAt: null, updatedAt: null, lastGeneratedAt: null },
        },
        ui: {
          templateSelectorOpen: false,
          savingTemplate: false,
          generatingFile: false,
          errorMessage: null,
          successMessage: null,
        },
      },
    },
  });

const sampleTemplates = [
  {
    id: 'tpl-001',
    templateId: 'tpl-001',
    templateName: 'May 2026 Payroll',
    employees: [{ id: 'e1', fullName: 'Ahmed', salary: 5000 }],
    companyInfo: { organizationName: 'White Caves Real Estate', employerOrgNo: 'ORG-001' },
    createdAt: '2026-05-01T00:00:00.000Z',
    savedAt: '2026-05-01T00:00:00.000Z',
  },
  {
    id: 'tpl-002',
    templateId: 'tpl-002',
    templateName: 'June 2026 Payroll',
    employees: [{ id: 'e2', fullName: 'Sara', salary: 6000 }],
    companyInfo: { organizationName: 'Desert Real Estate LLC', employerOrgNo: 'ORG-002' },
    createdAt: '2026-06-01T00:00:00.000Z',
    savedAt: '2026-06-01T00:00:00.000Z',
  },
];

const renderModal = (isOpen = true, templates = sampleTemplates, onClose = vi.fn()) => {
  const store = makeStore(templates);
  render(
    <Provider store={store}>
      <TemplateSelectorModal isOpen={isOpen} onClose={onClose} />
    </Provider>,
  );
  return { store, onClose };
};

afterEach(() => vi.restoreAllMocks());

// ── closed state ──────────────────────────────────────────────────────────────

describe('TemplateSelectorModal — closed', () => {
  it('renders nothing when isOpen=false', () => {
    renderModal(false);
    expect(screen.queryByText('Load Template')).toBeNull();
  });

  it('renders nothing when isOpen=false even with templates in store', () => {
    renderModal(false, sampleTemplates);
    expect(screen.queryByRole('textbox')).toBeNull();
  });
});

// ── open state — structure ────────────────────────────────────────────────────

describe('TemplateSelectorModal — structure when open', () => {
  it('renders the "Load Template" heading', () => {
    renderModal();
    expect(screen.getByText('Load Template')).toBeDefined();
  });

  it('renders the search input', () => {
    renderModal();
    expect(screen.getByRole('textbox')).toBeDefined();
  });

  it('search input has correct placeholder', () => {
    renderModal();
    const input = screen.getByRole('textbox');
    expect(input.placeholder).toMatch(/search templates/i);
  });

  it('renders the ✕ close button', () => {
    renderModal();
    expect(screen.getByTitle('Close')).toBeDefined();
  });

  it('renders a footer Close button', () => {
    renderModal();
    // The footer close button role is 'button' with text 'Close'
    expect(screen.getByRole('button', { name: /^close$/i })).toBeDefined();
  });
});

// ── empty templates ───────────────────────────────────────────────────────────

describe('TemplateSelectorModal — empty template store', () => {
  it('shows the "No templates saved yet" message', () => {
    renderModal(true, []);
    expect(screen.getByText(/no templates saved yet/i)).toBeDefined();
  });

  it('shows "0 of 0 templates" in the footer', () => {
    renderModal(true, []);
    expect(screen.getByText(/0 of 0 templates/i)).toBeDefined();
  });
});

// ── populated templates ───────────────────────────────────────────────────────

describe('TemplateSelectorModal — templates visible', () => {
  it('renders template names from the store', () => {
    renderModal();
    expect(screen.getByText('May 2026 Payroll')).toBeDefined();
    expect(screen.getByText('June 2026 Payroll')).toBeDefined();
  });

  it('shows "2 of 2 templates" in the footer', () => {
    renderModal();
    expect(screen.getByText(/2 of 2 templates/i)).toBeDefined();
  });
});

// ── search / filter ───────────────────────────────────────────────────────────

describe('TemplateSelectorModal — search filtering', () => {
  it('filters templates by name (case-insensitive)', () => {
    renderModal();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'may' } });
    expect(screen.getByText('May 2026 Payroll')).toBeDefined();
    expect(screen.queryByText('June 2026 Payroll')).toBeNull();
  });

  it('shows "1 of 2 templates" after filtering to one result', () => {
    renderModal();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'may' } });
    expect(screen.getByText(/1 of 2 templates/i)).toBeDefined();
  });

  it('filters by organizationName', () => {
    renderModal();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'desert' } });
    expect(screen.getByText('June 2026 Payroll')).toBeDefined();
    expect(screen.queryByText('May 2026 Payroll')).toBeNull();
  });

  it('filters by employerOrgNo', () => {
    renderModal();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'ORG-001' } });
    expect(screen.getByText('May 2026 Payroll')).toBeDefined();
    expect(screen.queryByText('June 2026 Payroll')).toBeNull();
  });

  it('shows "No templates match" when search has no results', () => {
    renderModal();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'ZZZZZZ' } });
    expect(screen.getByText(/no templates match/i)).toBeDefined();
  });

  it('shows "0 of 2 templates" when no results match', () => {
    renderModal();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'ZZZZZZ' } });
    expect(screen.getByText(/0 of 2 templates/i)).toBeDefined();
  });

  it('restores all results when search is cleared', () => {
    renderModal();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'may' } });
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '' } });
    expect(screen.getByText('May 2026 Payroll')).toBeDefined();
    expect(screen.getByText('June 2026 Payroll')).toBeDefined();
  });
});

// ── close interactions ────────────────────────────────────────────────────────

describe('TemplateSelectorModal — close interactions', () => {
  it('clicking ✕ header button calls onClose', () => {
    const { onClose } = renderModal();
    fireEvent.click(screen.getByTitle('Close'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('clicking footer Close button calls onClose', () => {
    const { onClose } = renderModal();
    fireEvent.click(screen.getByRole('button', { name: /^close$/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('clicking the overlay (outer div) calls onClose', () => {
    const { onClose } = renderModal();
    const overlay = document.querySelector('.sif-template-modal-overlay');
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('clicking inside the modal content does NOT call onClose', () => {
    const { onClose } = renderModal();
    const modal = document.querySelector('.sif-template-modal');
    fireEvent.click(modal);
    expect(onClose).not.toHaveBeenCalled();
  });
});
