/**
 * ValidationPanel — unit tests
 *
 * The component re-validates on every render via validateSIFFile(employees, companyInfo).
 * We control its view entirely through preloaded Redux state.
 *
 * Clean path  → "All validation checks passed!"
 * Error paths → "Validation Issues" heading, summary counts, error list
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import payrollReducer from '../../store/payrollSlice';
import ValidationPanel from './ValidationPanel';

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

const renderPanel = (currentFileOverrides = {}) => {
  const store = makeStore(currentFileOverrides);
  return render(
    <Provider store={store}>
      <ValidationPanel />
    </Provider>,
  );
};

// ── valid fixtures (must satisfy sifValidator's exact rules) ─────────────────
// UAE IBAN with valid mod-97 checksum (verified in sifValidator.test.js)
const VALID_IBAN = 'AE030359356491705358002';
const VALID_ROUTING = '033123456';

const validCompany = {
  employerOrgNo: '1234567890123',
  organizationName: 'White Caves Real Estate LLC',
  iban: VALID_IBAN,
  routingCode: VALID_ROUTING,
};

// Fields checked by validateEmployeeRecord: emiratesId, fullName, accountNumber, salary
const validEmployee = {
  emiratesId: '784199012345678',
  fullName: 'Ahmed Al Mansouri',
  accountNumber: VALID_IBAN,
  salary: 5000,
  allowance: 500,
};

// ── clean state ───────────────────────────────────────────────────────────────

describe('ValidationPanel — clean state', () => {
  it('shows "All validation checks passed!" when data is valid', () => {
    renderPanel({ companyInfo: validCompany, employees: [validEmployee] });
    expect(screen.getByText(/all validation checks passed/i)).toBeDefined();
  });

  it('shows "Ready to generate" hint in clean state', () => {
    renderPanel({ companyInfo: validCompany, employees: [validEmployee] });
    expect(screen.getByText(/ready to generate/i)).toBeDefined();
  });

  it('does NOT render the error list in clean state', () => {
    renderPanel({ companyInfo: validCompany, employees: [validEmployee] });
    expect(screen.queryByRole('list')).toBeNull();
  });
});

// ── error state ───────────────────────────────────────────────────────────────

describe('ValidationPanel — error state', () => {
  it('shows "Validation Issues" heading when data is incomplete', () => {
    // Empty companyInfo + no employees → many validation errors
    renderPanel();
    expect(screen.getByText(/Validation Issues/i)).toBeDefined();
  });

  it('shows issue count badge', () => {
    renderPanel();
    // Badge text is exactly "N issues" — anchor regex to avoid matching heading
    expect(screen.getByText(/^\d+ issues?$/)).toBeDefined();
  });

  it('renders the error list', () => {
    renderPanel();
    expect(screen.getByRole('list')).toBeDefined();
  });

  it('shows "Fix all issues before generating" hint', () => {
    renderPanel();
    expect(screen.getByText(/fix all issues before generating/i)).toBeDefined();
  });

  it('shows company summary item when company fields are missing', () => {
    renderPanel();
    expect(screen.getByText(/company field/i)).toBeDefined();
  });

  it('shows employee summary item when employee data is invalid', () => {
    // Remove emiratesId and fullName — actual fields validated by validateEmployeeRecord
    const badEmployee = { ...validEmployee, emiratesId: '', fullName: '' };
    renderPanel({ companyInfo: validCompany, employees: [badEmployee] });
    // Employee summary item: "N employee issue(s)" — use specific matcher
    expect(screen.getByText(/employee issue/i)).toBeDefined();
  });
});
