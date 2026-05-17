/**
 * SaveTemplateForm — unit tests
 *
 * Toggle button expands/collapses the form.
 * Validation guards dispatch setErrorMessage on bad input.
 * Valid submit dispatches saveTemplate + setSuccessMessage, then collapses form.
 */
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import payrollReducer from '../../store/payrollSlice';
import SaveTemplateForm from './SaveTemplateForm';

// ── store factory ─────────────────────────────────────────────────────────────

const makeStore = (currentFileOverrides = {}) =>
  configureStore({
    reducer: { payroll: payrollReducer },
    preloadedState: {
      payroll: {
        templates: [],
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
          ...currentFileOverrides,
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

const validCompany = {
  employerOrgNo: '12345678901234',
  organizationName: 'White Caves RE',
  bankCode: '033',
  routingCode: '0330003',
  accountNumber: '123456789012',
  iban: 'AE030330000123456789012',
  accountHolderName: 'White Caves RE',
  email: 'pay@wc.ae',
  phone: '+97142000000',
};

const validEmployee = {
  id: 'e1',
  employeeId: 'EMP001',
  employeeName: 'Ahmed',
  basicSalary: 5000,
  salary: 5000,
  bankCode: '033',
  routingCode: '0330003',
  iban: 'AE030330000987654321001',
  employmentType: '1',
};

const renderForm = (currentFileOverrides = {}) => {
  const store = makeStore(currentFileOverrides);
  return {
    store,
    ...render(
      <Provider store={store}>
        <SaveTemplateForm />
      </Provider>,
    ),
  };
};

// Helper: open the form
const openForm = () => fireEvent.click(screen.getByRole('button', { name: /save as template/i }));

afterEach(() => vi.restoreAllMocks());

// ── toggle ────────────────────────────────────────────────────────────────────

describe('SaveTemplateForm — toggle', () => {
  it('shows only the toggle button initially (form is collapsed)', () => {
    renderForm();
    expect(screen.getByRole('button', { name: /save as template/i })).toBeDefined();
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('expands the form on toggle click', () => {
    renderForm();
    openForm();
    expect(screen.getByRole('textbox')).toBeDefined();
  });

  it('Cancel button collapses the form', () => {
    renderForm();
    openForm();
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.queryByRole('textbox')).toBeNull();
  });
});

// ── validation guards ─────────────────────────────────────────────────────────

describe('SaveTemplateForm — validation guards', () => {
  it('dispatches errorMessage when name is blank', async () => {
    const { store } = renderForm({ companyInfo: validCompany, employees: [validEmployee] });
    openForm();
    // Submit without entering a name
    fireEvent.submit(screen.getByRole('button', { name: /save template/i }).closest('form'));
    await waitFor(() => {
      expect(store.getState().payroll.ui.errorMessage).toMatch(/cannot be empty/i);
    });
  });

  it('dispatches errorMessage when name exceeds 50 chars', async () => {
    const { store } = renderForm({ companyInfo: validCompany, employees: [validEmployee] });
    openForm();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'A'.repeat(51) } });
    fireEvent.submit(screen.getByRole('button', { name: /save template/i }).closest('form'));
    await waitFor(() => {
      expect(store.getState().payroll.ui.errorMessage).toMatch(/50 characters/i);
    });
  });

  it('dispatches errorMessage when no employees have been added', async () => {
    const { store } = renderForm({ companyInfo: validCompany, employees: [] });
    openForm();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Test Template' } });
    fireEvent.submit(screen.getByRole('button', { name: /save template/i }).closest('form'));
    await waitFor(() => {
      expect(store.getState().payroll.ui.errorMessage).toMatch(/no employees/i);
    });
  });

  it('dispatches errorMessage when company info is incomplete', async () => {
    const { store } = renderForm({
      companyInfo: { employerOrgNo: '', iban: '' },
      employees: [validEmployee],
    });
    openForm();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Test Template' } });
    fireEvent.submit(screen.getByRole('button', { name: /save template/i }).closest('form'));
    await waitFor(() => {
      expect(store.getState().payroll.ui.errorMessage).toMatch(/incomplete company/i);
    });
  });
});

// ── successful save ───────────────────────────────────────────────────────────

describe('SaveTemplateForm — successful save', () => {
  it('dispatches saveTemplate and adds a template to the store', async () => {
    const { store } = renderForm({ companyInfo: validCompany, employees: [validEmployee] });
    openForm();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Q2 Payroll' } });
    fireEvent.submit(screen.getByRole('button', { name: /save template/i }).closest('form'));
    await waitFor(() => {
      expect(store.getState().payroll.templates).toHaveLength(1);
      expect(store.getState().payroll.templates[0].templateName).toBe('Q2 Payroll');
    });
  });

  it('dispatches successMessage after saving', async () => {
    const { store } = renderForm({ companyInfo: validCompany, employees: [validEmployee] });
    openForm();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Q2 Payroll' } });
    fireEvent.submit(screen.getByRole('button', { name: /save template/i }).closest('form'));
    await waitFor(() => {
      expect(store.getState().payroll.ui.successMessage).toMatch(/saved successfully/i);
    });
  });

  it('collapses the form and clears the input after successful save', async () => {
    renderForm({ companyInfo: validCompany, employees: [validEmployee] });
    openForm();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Q2 Payroll' } });
    fireEvent.submit(screen.getByRole('button', { name: /save template/i }).closest('form'));
    await waitFor(() => {
      expect(screen.queryByRole('textbox')).toBeNull();
    });
  });
});

// ── character counter ─────────────────────────────────────────────────────────

describe('SaveTemplateForm — character counter', () => {
  it('shows 0/50 initially', () => {
    renderForm();
    openForm();
    expect(screen.getByText('0/50 characters')).toBeDefined();
  });

  it('updates counter as user types', () => {
    renderForm();
    openForm();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Hello' } });
    expect(screen.getByText('5/50 characters')).toBeDefined();
  });
});
