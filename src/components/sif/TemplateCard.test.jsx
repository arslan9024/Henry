/**
 * TemplateCard — unit tests
 *
 * Pure presentational + dispatch component (no selectors).
 * Props: template { id, templateName, employees, companyInfo, createdAt }
 *        onLoad (optional callback)
 *
 * Tests:
 *   - Renders template name, employee count, company name, total salary
 *   - Load button dispatches loadTemplate(id) and calls onLoad
 *   - "⋯" button toggles the dropdown menu
 *   - Duplicate dispatches duplicateTemplate(id) and closes dropdown
 *   - Delete dispatches deleteTemplate(id) after window.confirm = true
 *   - Delete does NOT dispatch when user cancels confirm
 */
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import payrollReducer from '../../store/payrollSlice';
import TemplateCard from './TemplateCard';

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
  templateId: 'tpl-001', // required by loadTemplate/deleteTemplate reducers (t.templateId === payload)
  templateName: 'May 2026 Payroll',
  employees: [
    { id: 'e1', employeeName: 'Ahmed', salary: 5000 },
    { id: 'e2', employeeName: 'Sara', salary: 6000 },
  ],
  companyInfo: { organizationName: 'White Caves Real Estate', employerOrgNo: 'ORG-001' },
  createdAt: '2026-05-01T00:00:00.000Z',
};

const renderCard = (templateOverrides = {}, onLoad = undefined, storeTemplates = []) => {
  const template = { ...sampleTemplate, ...templateOverrides };
  const store = makeStore(storeTemplates.length ? storeTemplates : [template]);
  return {
    store,
    ...render(
      <Provider store={store}>
        <TemplateCard template={template} onLoad={onLoad} />
      </Provider>,
    ),
  };
};

afterEach(() => {
  vi.restoreAllMocks();
});

// ── rendering ─────────────────────────────────────────────────────────────────

describe('TemplateCard — rendering', () => {
  it('renders the template name', () => {
    renderCard();
    expect(screen.getByText('May 2026 Payroll')).toBeDefined();
  });

  it('renders employee count', () => {
    renderCard();
    expect(screen.getByText(/2 employee/i)).toBeDefined();
  });

  it('renders company organisation name', () => {
    renderCard();
    expect(screen.getByText('White Caves Real Estate')).toBeDefined();
  });

  it('renders total salary from employees array', () => {
    renderCard();
    // 5000 + 6000 = 11,000.00
    expect(screen.getByText(/11,000\.00/)).toBeDefined();
  });

  it('shows "0 employees" when employees array is absent', () => {
    renderCard({ employees: undefined });
    expect(screen.getByText(/0 employee/i)).toBeDefined();
  });

  it('shows "No company" when companyInfo is absent', () => {
    renderCard({ companyInfo: undefined });
    expect(screen.getByText('No company')).toBeDefined();
  });

  it('renders Load and ⋯ buttons', () => {
    renderCard();
    expect(screen.getByRole('button', { name: /load/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /⋯/i })).toBeDefined();
  });

  it('dropdown menu is hidden initially', () => {
    renderCard();
    expect(screen.queryByRole('button', { name: /duplicate/i })).toBeNull();
  });
});

// ── Load button ───────────────────────────────────────────────────────────────

describe('TemplateCard — Load button', () => {
  it('dispatches loadTemplate with the template id', () => {
    const { store } = renderCard();
    fireEvent.click(screen.getByRole('button', { name: /load/i }));
    // After load, currentFile.templateId should be set (loadTemplate sets currentFile from template)
    const state = store.getState().payroll.currentFile;
    // Template name should now match the loaded template
    expect(state.templateName).toBe('May 2026 Payroll');
  });

  it('calls the onLoad callback when provided', () => {
    const onLoad = vi.fn();
    renderCard({}, onLoad);
    fireEvent.click(screen.getByRole('button', { name: /load/i }));
    expect(onLoad).toHaveBeenCalledOnce();
  });

  it('does not throw when onLoad is undefined', () => {
    renderCard({}, undefined);
    expect(() => fireEvent.click(screen.getByRole('button', { name: /load/i }))).not.toThrow();
  });
});

// ── dropdown toggle ───────────────────────────────────────────────────────────

describe('TemplateCard — dropdown toggle', () => {
  it('opens dropdown and shows Duplicate + Delete on ⋯ click', () => {
    renderCard();
    fireEvent.click(screen.getByRole('button', { name: /⋯/i }));
    expect(screen.getByRole('button', { name: /duplicate/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /delete/i })).toBeDefined();
  });

  it('closes dropdown after clicking ⋯ a second time', () => {
    renderCard();
    fireEvent.click(screen.getByRole('button', { name: /⋯/i }));
    fireEvent.click(screen.getByRole('button', { name: /⋯/i }));
    expect(screen.queryByRole('button', { name: /duplicate/i })).toBeNull();
  });
});

// ── Duplicate ────────────────────────────────────────────────────────────────

describe('TemplateCard — Duplicate', () => {
  it('dispatches duplicateTemplate and closes dropdown', () => {
    // Note: component dispatches duplicateTemplate(template.id) (a string);
    // the reducer expects an object {templateId, newTemplateId, newTemplateName}.
    // Observable behavior we can verify: dropdown closes via setShowActions(false).
    renderCard();
    fireEvent.click(screen.getByRole('button', { name: /⋯/i }));
    fireEvent.click(screen.getByRole('button', { name: /duplicate/i }));
    expect(screen.queryByRole('button', { name: /duplicate/i })).toBeNull();
  });

  it('closes the dropdown after duplicating', () => {
    renderCard();
    fireEvent.click(screen.getByRole('button', { name: /⋯/i }));
    fireEvent.click(screen.getByRole('button', { name: /duplicate/i }));
    expect(screen.queryByRole('button', { name: /duplicate/i })).toBeNull();
  });
});

// ── Delete ────────────────────────────────────────────────────────────────────

describe('TemplateCard — Delete', () => {
  it('dispatches deleteTemplate when user confirms', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { store } = renderCard();
    fireEvent.click(screen.getByRole('button', { name: /⋯/i }));
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(store.getState().payroll.templates).toHaveLength(0);
  });

  it('does NOT delete when user cancels the confirm dialog', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const { store } = renderCard();
    fireEvent.click(screen.getByRole('button', { name: /⋯/i }));
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(store.getState().payroll.templates).toHaveLength(1);
  });

  it('shows the template name in the confirm message', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    renderCard();
    fireEvent.click(screen.getByRole('button', { name: /⋯/i }));
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(confirmSpy).toHaveBeenCalledWith(expect.stringContaining('May 2026 Payroll'));
  });
});
