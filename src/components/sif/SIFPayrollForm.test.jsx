/**
 * SIFPayrollForm — component tests
 *
 * Covers:
 *  1. Renders all major sections (Employees, Generate Files)
 *  2. Add Employee form fields are present
 *  3. handleAddEmployee — missing required fields sets error message in Redux
 *  4. handleAddEmployee — with valid data dispatches addEmployee + form resets
 *  5. Generate button disabled when employee list is empty
 *  6. Generate button disabled when validation errors exist
 *  7. Download format radio defaults to 'sif'
 *  8. Switching format radio to 'both' works
 *  9. Successful generation adds history record and sets success message
 * 10. Failed generation (result.success = false) sets error message
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import payrollReducer from '../../store/payrollSlice';

// ── Mocks for heavy sub-components ───────────────────────────────────────────
vi.mock('./CompanyInfoSection', () => ({
  default: () => <div data-testid="mock-company-info">CompanyInfo</div>,
}));
vi.mock('./EmployeeRow', () => ({
  default: ({ employee, index }) => <div data-testid={`mock-employee-row-${index}`}>{employee.fullName}</div>,
}));
vi.mock('./ValidationPanel', () => ({
  default: () => <div data-testid="mock-validation-panel">ValidationPanel</div>,
}));
vi.mock('./HistoryPanel', () => ({
  default: () => <div data-testid="mock-history-panel">HistoryPanel</div>,
}));
vi.mock('./TemplateManagerSection', () => ({
  default: () => <div data-testid="mock-template-manager">TemplateManager</div>,
}));

// ── Mocks for service dependencies ───────────────────────────────────────────
vi.mock('../../compliance/sifValidator', () => ({
  validateSIFFile: vi.fn(() => ({ isValid: true, errors: [], summary: { totalErrors: 0 } })),
}));

vi.mock('../../pdf/generateSIFFile', () => ({
  generateAndDownloadSIFFile: vi.fn(async () => ({
    success: true,
    sifFilename: 'WPS_20260501.sif',
  })),
}));

import { validateSIFFile } from '../../compliance/sifValidator';
import { generateAndDownloadSIFFile } from '../../pdf/generateSIFFile';
import SIFPayrollForm from './SIFPayrollForm';

// ── Helpers ───────────────────────────────────────────────────────────────────
const makeStore = (preloadedState = {}) =>
  configureStore({
    reducer: { payroll: payrollReducer },
    preloadedState,
  });

const renderForm = (preloadedState = {}) => {
  const store = makeStore(preloadedState);
  const view = render(
    <Provider store={store}>
      <SIFPayrollForm />
    </Provider>,
  );
  return { ...view, store };
};

/** Fill all required add-employee inputs and click Add Employee. */
const fillAndSubmitEmployee = (overrides = {}) => {
  const data = {
    emiratesId: '784199012345678',
    fullName: 'Hassan Al Marzouqi',
    accountNumber: 'AE030359356491705358002',
    salary: '8000',
    ...overrides,
  };
  fireEvent.change(screen.getByPlaceholderText(/Emirates ID/i), { target: { value: data.emiratesId } });
  fireEvent.change(screen.getByPlaceholderText(/Full Name/i), { target: { value: data.fullName } });
  fireEvent.change(screen.getByPlaceholderText(/Account Number/i), { target: { value: data.accountNumber } });
  fireEvent.change(screen.getByPlaceholderText(/Salary \(AED\)/i), { target: { value: data.salary } });
  fireEvent.click(screen.getByRole('button', { name: /Add Employee/i }));
  return data;
};

beforeEach(() => {
  vi.clearAllMocks();
  URL.createObjectURL = vi.fn().mockReturnValue('blob:mock');
  URL.revokeObjectURL = vi.fn();
});

afterEach(() => {
  delete URL.createObjectURL;
  delete URL.revokeObjectURL;
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('SIFPayrollForm', () => {
  it('renders section headings and sub-component stubs', () => {
    renderForm();

    // Use heading role to avoid collisions with "Add New Employee" text
    expect(screen.getByRole('heading', { name: /Employees/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Generate Files/i })).toBeInTheDocument();
    expect(screen.getByTestId('mock-company-info')).toBeInTheDocument();
    expect(screen.getByTestId('mock-template-manager')).toBeInTheDocument();
    expect(screen.getByTestId('mock-validation-panel')).toBeInTheDocument();
    expect(screen.getByTestId('mock-history-panel')).toBeInTheDocument();
  });

  it('renders the Add New Employee form with 5 inputs and a submit button', () => {
    renderForm();

    expect(screen.getByPlaceholderText(/Emirates ID/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Account Number/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Salary \(AED\)/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Allowance \(AED\)/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Employee/i })).toBeInTheDocument();
  });

  it('sets an error message in Redux when required fields are missing on add', () => {
    const { store } = renderForm();

    // Only fill name — leave emiratesId, accountNumber, salary blank
    fireEvent.change(screen.getByPlaceholderText(/Full Name/i), {
      target: { value: 'Incomplete Person' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Add Employee/i }));

    expect(store.getState().payroll.ui.errorMessage).toMatch(/required/i);
    // No employee should be added
    expect(store.getState().payroll.currentFile.employees).toHaveLength(0);
  });

  it('adds employee to Redux when all required fields are provided', () => {
    const { store } = renderForm();

    fillAndSubmitEmployee();

    const employees = store.getState().payroll.currentFile.employees;
    expect(employees).toHaveLength(1);
    expect(employees[0].fullName).toBe('Hassan Al Marzouqi');
    expect(employees[0].emiratesId).toBe('784199012345678');
  });

  it('resets the add-employee form inputs after a successful add', () => {
    renderForm();

    fillAndSubmitEmployee();

    // Inputs should be cleared back to empty
    expect(screen.getByPlaceholderText(/Emirates ID/i)).toHaveValue('');
    expect(screen.getByPlaceholderText(/Full Name/i)).toHaveValue('');
    expect(screen.getByPlaceholderText(/Salary \(AED\)/i)).toHaveValue(null);
  });

  it('disables the Generate button when the employee list is empty', () => {
    renderForm();

    const btn = screen.getByRole('button', { name: /Generate & Download/i });
    expect(btn).toBeDisabled();
  });

  it('disables the Generate button when validation errors exist even with employees', () => {
    const baseState = makeStore().getState().payroll;
    const { store } = renderForm({
      payroll: {
        ...baseState,
        currentFile: {
          ...baseState.currentFile,
          employees: [
            {
              id: 'emp_err',
              emiratesId: '784199012345678',
              fullName: 'Test User',
              accountNumber: 'AE030359356491705358002',
              salary: '5000',
              allowance: '0',
            },
          ],
          validationErrors: [{ field: 'iban', message: 'Invalid IBAN' }],
        },
      },
    });

    const btn = screen.getByRole('button', { name: /Generate & Download/i });
    expect(btn).toBeDisabled();
    expect(store.getState().payroll.currentFile.validationErrors).toHaveLength(1);
  });

  it('Download format radio defaults to "SIF only"', () => {
    renderForm();

    const sifRadio = screen.getByRole('radio', { name: /Download SIF only/i });
    const bothRadio = screen.getByRole('radio', { name: /Download SIF \+ Verification/i });

    expect(sifRadio).toBeChecked();
    expect(bothRadio).not.toBeChecked();
  });

  it('can switch download format to "both"', () => {
    renderForm();

    const bothRadio = screen.getByRole('radio', { name: /Download SIF \+ Verification/i });
    fireEvent.click(bothRadio);

    expect(bothRadio).toBeChecked();
    expect(screen.getByRole('radio', { name: /Download SIF only/i })).not.toBeChecked();
  });

  it('successful generation adds a history record and sets success message', async () => {
    generateAndDownloadSIFFile.mockResolvedValue({
      success: true,
      sifFilename: 'WPS_20260501.sif',
    });
    validateSIFFile.mockReturnValue({ isValid: true, errors: [], summary: { totalErrors: 0 } });

    // Start with one employee pre-loaded so the button is enabled
    const preloadedState = {
      payroll: {
        ...makeStore().getState().payroll,
        currentFile: {
          ...makeStore().getState().payroll.currentFile,
          employees: [
            {
              id: 'emp_1',
              emiratesId: '784199012345678',
              fullName: 'Layla Al Zaabi',
              accountNumber: 'AE030359356491705358002',
              salary: '7500',
              allowance: '0',
            },
          ],
        },
      },
    };

    const { store } = renderForm(preloadedState);

    fireEvent.click(screen.getByRole('button', { name: /Generate & Download/i }));

    await waitFor(() => {
      expect(store.getState().payroll.ui.successMessage).toMatch(/WPS_20260501\.sif/);
    });
    expect(store.getState().payroll.history).toHaveLength(1);
    expect(store.getState().payroll.history[0].employeeCount).toBe(1);
  });

  it('failed generation sets an error message when result.success is false', async () => {
    generateAndDownloadSIFFile.mockResolvedValue({
      success: false,
      error: 'Disk write failed',
    });
    validateSIFFile.mockReturnValue({ isValid: true, errors: [], summary: { totalErrors: 0 } });

    const preloadedState = {
      payroll: {
        ...makeStore().getState().payroll,
        currentFile: {
          ...makeStore().getState().payroll.currentFile,
          employees: [
            {
              id: 'emp_1',
              emiratesId: '784199012345678',
              fullName: 'Omar Bin Khalid',
              accountNumber: 'AE030359356491705358002',
              salary: '6000',
              allowance: '0',
            },
          ],
        },
      },
    };

    const { store } = renderForm(preloadedState);

    fireEvent.click(screen.getByRole('button', { name: /Generate & Download/i }));

    await waitFor(() => {
      expect(store.getState().payroll.ui.errorMessage).toMatch(/Disk write failed/);
    });
    // No history entry on failure
    expect(store.getState().payroll.history).toHaveLength(0);
  });

  it('shows the salary summary when employees are present', () => {
    const preloadedState = {
      payroll: {
        ...makeStore().getState().payroll,
        currentFile: {
          ...makeStore().getState().payroll.currentFile,
          employees: [
            { id: 'e1', emiratesId: '1', fullName: 'A', accountNumber: '1', salary: '3000', allowance: '0' },
            { id: 'e2', emiratesId: '2', fullName: 'B', accountNumber: '2', salary: '2000', allowance: '0' },
          ],
        },
      },
    };
    renderForm(preloadedState);

    // Total salary label
    expect(screen.getByText(/Total Salary/i)).toBeInTheDocument();
    // Total Employees count
    expect(screen.getByText(/Total Employees/i)).toBeInTheDocument();
    // Salary sum displayed
    expect(screen.getByText(/5000\.00/)).toBeInTheDocument();
  });
});
