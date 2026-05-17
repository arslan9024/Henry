/**
 * TemplateManagerSection.test.jsx
 * Tests for the SIF TemplateManagerSection component.
 *
 * Behaviour:
 *   - Renders SaveTemplateForm (always)
 *   - Shows "No templates saved" hint when store is empty
 *   - Shows "Load Template (N)" button only when templates exist
 *   - Clicking "Load Template" opens the TemplateSelectorModal
 *   - Closing the modal hides it again
 *   - Shows correct template count in hint text and button
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import payrollReducer from '../../store/payrollSlice';
import TemplateManagerSection from './TemplateManagerSection';

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

const sampleTemplate = {
  id: 'tpl-001',
  templateId: 'tpl-001',
  templateName: 'May 2026 Payroll',
  employees: [{ id: 'e1', fullName: 'Ahmed', salary: 5000 }],
  companyInfo: { organizationName: 'White Caves RE', employerOrgNo: 'ORG-001' },
  createdAt: '2026-05-01T00:00:00.000Z',
  savedAt: '2026-05-01T00:00:00.000Z',
};

const renderSection = (templates = []) => {
  const store = makeStore(templates);
  render(
    <Provider store={store}>
      <TemplateManagerSection />
    </Provider>,
  );
  return { store };
};

// ── empty store ───────────────────────────────────────────────────────────────

describe('TemplateManagerSection — no templates', () => {
  it('renders without crashing', () => {
    renderSection();
    // SaveTemplateForm always renders its toggle button "💾 Save as Template"
    expect(screen.getByRole('button', { name: /save as template/i })).toBeDefined();
  });

  it('shows the "Save your first template" hint', () => {
    renderSection();
    expect(screen.getByText(/save your first template/i)).toBeDefined();
  });

  it('does NOT show the "Load Template" button when store is empty', () => {
    renderSection();
    expect(screen.queryByRole('button', { name: /load template/i })).toBeNull();
  });
});

// ── with templates ────────────────────────────────────────────────────────────

describe('TemplateManagerSection — with templates', () => {
  it('shows the "Load Template (1)" button when one template exists', () => {
    renderSection([sampleTemplate]);
    expect(screen.getByRole('button', { name: /load template \(1\)/i })).toBeDefined();
  });

  it('shows the correct count for two templates', () => {
    const two = [
      sampleTemplate,
      { ...sampleTemplate, id: 'tpl-002', templateId: 'tpl-002', templateName: 'June 2026' },
    ];
    renderSection(two);
    expect(screen.getByRole('button', { name: /load template \(2\)/i })).toBeDefined();
  });

  it('shows "N templates saved and ready" hint', () => {
    renderSection([sampleTemplate]);
    expect(screen.getByText(/1 template.* saved and ready/i)).toBeDefined();
  });

  it('shows "templates" (plural) in hint when more than one', () => {
    const two = [
      sampleTemplate,
      { ...sampleTemplate, id: 'tpl-002', templateId: 'tpl-002', templateName: 'June 2026' },
    ];
    renderSection(two);
    expect(screen.getByText(/2 templates.* saved and ready/i)).toBeDefined();
  });

  it('does NOT show the empty-state hint when templates exist', () => {
    renderSection([sampleTemplate]);
    expect(screen.queryByText(/save your first template/i)).toBeNull();
  });
});

// ── modal open / close ────────────────────────────────────────────────────────

describe('TemplateManagerSection — modal toggle', () => {
  it('modal is not visible initially', () => {
    renderSection([sampleTemplate]);
    expect(screen.queryByText('Load Template')).toBeNull();
  });

  it('clicking "Load Template" opens the TemplateSelectorModal', () => {
    renderSection([sampleTemplate]);
    fireEvent.click(screen.getByRole('button', { name: /load template \(1\)/i }));
    // Modal renders "Load Template" as a heading
    expect(screen.getByRole('heading', { name: /load template/i })).toBeDefined();
  });

  it('modal shows the template card after opening', () => {
    renderSection([sampleTemplate]);
    fireEvent.click(screen.getByRole('button', { name: /load template \(1\)/i }));
    expect(screen.getByText('May 2026 Payroll')).toBeDefined();
  });

  it('clicking the modal ✕ button closes the modal', () => {
    renderSection([sampleTemplate]);
    fireEvent.click(screen.getByRole('button', { name: /load template \(1\)/i }));
    fireEvent.click(screen.getByTitle('Close'));
    expect(screen.queryByRole('heading', { name: /load template/i })).toBeNull();
  });

  it('clicking the footer Close button inside the modal closes it', () => {
    renderSection([sampleTemplate]);
    fireEvent.click(screen.getByRole('button', { name: /load template \(1\)/i }));
    // Footer Close button is the only button named exactly "Close"
    const closeButtons = screen.getAllByRole('button', { name: /^close$/i });
    fireEvent.click(closeButtons[0]);
    expect(screen.queryByRole('heading', { name: /load template/i })).toBeNull();
  });
});
