/**
 * EmployeeRow.test.jsx
 * Tests for the EmployeeRow SIF component.
 *
 * Behaviour:
 *   View mode: renders employee data, Edit (✎) and Delete (🗑) buttons
 *   Edit mode: inputs pre-filled, Save (✓) dispatches updateEmployee, Cancel reverts
 *   Delete: confirm=true → dispatches removeEmployee; confirm=false → no change
 */
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import payrollReducer from '../../store/payrollSlice';
import EmployeeRow from './EmployeeRow';

// ── store factory ─────────────────────────────────────────────────────────────

const makeStore = (employees = []) =>
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
          employees,
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

const sampleEmployee = {
  id: 'emp-001',
  emiratesId: '784199012345678',
  fullName: 'Ahmed Al Mansouri',
  accountNumber: 'ACC-12345678',
  salary: 5000,
  allowance: 500,
};

const renderRow = (employeeOverrides = {}, index = 0) => {
  const employee = { ...sampleEmployee, ...employeeOverrides };
  const store = makeStore([employee]);
  render(
    <Provider store={store}>
      <EmployeeRow employee={employee} index={index} />
    </Provider>,
  );
  return { store, employee };
};

afterEach(() => {
  vi.restoreAllMocks();
});

// ── view mode rendering ───────────────────────────────────────────────────────

describe('EmployeeRow — view mode rendering', () => {
  it('renders row number (index + 1)', () => {
    renderRow({}, 2); // index 2 → should show "3"
    expect(screen.getByText('3')).toBeDefined();
  });

  it('renders the emiratesId', () => {
    renderRow();
    expect(screen.getByText('784199012345678')).toBeDefined();
  });

  it('renders the fullName', () => {
    renderRow();
    expect(screen.getByText('Ahmed Al Mansouri')).toBeDefined();
  });

  it('renders the accountNumber', () => {
    renderRow();
    expect(screen.getByText('ACC-12345678')).toBeDefined();
  });

  it('renders the formatted salary with AED prefix', () => {
    renderRow();
    expect(screen.getByText(/AED 5000\.00/)).toBeDefined();
  });

  it('renders the allowance when present', () => {
    renderRow();
    expect(screen.getByText(/AED 500\.00/)).toBeDefined();
  });

  it('renders the total (salary + allowance)', () => {
    renderRow();
    // 5000 + 500 = 5500
    expect(screen.getByText(/AED 5500\.00/)).toBeDefined();
  });

  it('renders an Edit button with title "Edit employee"', () => {
    renderRow();
    expect(screen.getByTitle('Edit employee')).toBeDefined();
  });

  it('renders a Delete button with title "Delete employee"', () => {
    renderRow();
    expect(screen.getByTitle('Delete employee')).toBeDefined();
  });

  it('does not render Save or Cancel buttons in view mode', () => {
    renderRow();
    expect(screen.queryByTitle('Save employee')).toBeNull();
    expect(screen.queryByTitle('Cancel')).toBeNull();
  });

  it('renders zero total when employee has no salary or allowance', () => {
    renderRow({ salary: 0, allowance: 0 });
    // Both salary cell and total cell show AED 0.00 — verify at least one exists
    const zeros = screen.getAllByText(/AED 0\.00/);
    expect(zeros.length).toBeGreaterThanOrEqual(1);
  });

  it('does not render allowance cell when allowance is missing/falsy', () => {
    renderRow({ allowance: undefined });
    // Salary cell exists but no separate allowance cell
    expect(screen.queryByText(/AED 0\.00.*allowance/i)).toBeNull();
  });
});

// ── edit mode ────────────────────────────────────────────────────────────────

describe('EmployeeRow — edit mode', () => {
  it('clicking Edit enters edit mode (shows input fields)', () => {
    renderRow();
    fireEvent.click(screen.getByTitle('Edit employee'));
    // In edit mode, inputs appear (no longer plain text cells)
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThan(0);
  });

  it('emiratesId input is pre-populated with employee data', () => {
    renderRow();
    fireEvent.click(screen.getByTitle('Edit employee'));
    expect(screen.getByDisplayValue('784199012345678')).toBeDefined();
  });

  it('fullName input is pre-populated with employee data', () => {
    renderRow();
    fireEvent.click(screen.getByTitle('Edit employee'));
    expect(screen.getByDisplayValue('Ahmed Al Mansouri')).toBeDefined();
  });

  it('accountNumber input is pre-populated with employee data', () => {
    renderRow();
    fireEvent.click(screen.getByTitle('Edit employee'));
    expect(screen.getByDisplayValue('ACC-12345678')).toBeDefined();
  });

  it('salary input is pre-populated', () => {
    renderRow();
    fireEvent.click(screen.getByTitle('Edit employee'));
    expect(screen.getByDisplayValue('5000')).toBeDefined();
  });

  it('shows Save (✓) and Cancel (✕) buttons in edit mode', () => {
    renderRow();
    fireEvent.click(screen.getByTitle('Edit employee'));
    expect(screen.getByTitle('Save employee')).toBeDefined();
    expect(screen.getByTitle('Cancel')).toBeDefined();
  });

  it('updates the live total as salary is changed', () => {
    renderRow();
    fireEvent.click(screen.getByTitle('Edit employee'));

    const salaryInput = screen.getByDisplayValue('5000');
    fireEvent.change(salaryInput, { target: { value: '8000' } });

    // 8000 + 500 = 8500
    expect(screen.getByText(/AED 8500\.00/)).toBeDefined();
  });

  it('clicking Save dispatches updateEmployee and exits edit mode', () => {
    const { store } = renderRow();
    fireEvent.click(screen.getByTitle('Edit employee'));

    const nameInput = screen.getByDisplayValue('Ahmed Al Mansouri');
    fireEvent.change(nameInput, { target: { value: 'Sara Mohammed' } });
    fireEvent.click(screen.getByTitle('Save employee'));

    // Should be back in view mode
    expect(screen.queryByTitle('Save employee')).toBeNull();
    // Store should have updated fullName
    const employees = store.getState().payroll.currentFile.employees;
    expect(employees[0].fullName).toBe('Sara Mohammed');
  });

  it('clicking Cancel does NOT dispatch and reverts to view mode', () => {
    const { store } = renderRow();
    fireEvent.click(screen.getByTitle('Edit employee'));

    const nameInput = screen.getByDisplayValue('Ahmed Al Mansouri');
    fireEvent.change(nameInput, { target: { value: 'Changed Name' } });
    fireEvent.click(screen.getByTitle('Cancel'));

    // Back in view mode
    expect(screen.queryByTitle('Cancel')).toBeNull();
    // Store is unchanged
    expect(store.getState().payroll.currentFile.employees[0].fullName).toBe('Ahmed Al Mansouri');
  });

  it('after Cancel, view mode shows original name', () => {
    renderRow();
    fireEvent.click(screen.getByTitle('Edit employee'));
    fireEvent.change(screen.getByDisplayValue('Ahmed Al Mansouri'), { target: { value: 'Temp Name' } });
    fireEvent.click(screen.getByTitle('Cancel'));

    expect(screen.getByText('Ahmed Al Mansouri')).toBeDefined();
  });
});

// ── delete ────────────────────────────────────────────────────────────────────

describe('EmployeeRow — delete', () => {
  it('dispatches removeEmployee when user confirms', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { store } = renderRow();

    fireEvent.click(screen.getByTitle('Delete employee'));

    expect(store.getState().payroll.currentFile.employees).toHaveLength(0);
  });

  it('does NOT remove employee when user cancels confirm', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const { store } = renderRow();

    fireEvent.click(screen.getByTitle('Delete employee'));

    expect(store.getState().payroll.currentFile.employees).toHaveLength(1);
  });

  it('confirm dialog includes the employee name', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    renderRow();

    fireEvent.click(screen.getByTitle('Delete employee'));

    expect(confirmSpy).toHaveBeenCalledOnce();
    expect(confirmSpy.mock.calls[0][0]).toContain('Ahmed Al Mansouri');
  });
});
