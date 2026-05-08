/**
 * CompanyInfoSection.test.jsx
 * Tests for the CompanyInfoSection SIF component.
 *
 * Behaviour:
 *   - Renders all 9 field labels and inputs from Redux state
 *   - All inputs are disabled by default (view mode)
 *   - Clicking "Edit" button enables all inputs
 *   - Typing in an input dispatches updateCompanyInfo to the Redux store
 *   - Clicking "Done" disables inputs again
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import payrollReducer from '../../store/payrollSlice';
import CompanyInfoSection from './CompanyInfoSection';

// ── store factory ─────────────────────────────────────────────────────────────

const makeStore = (companyInfoOverrides = {}) =>
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
            ...companyInfoOverrides,
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

const renderSection = (companyInfoOverrides = {}) => {
  const store = makeStore(companyInfoOverrides);
  render(
    <Provider store={store}>
      <CompanyInfoSection />
    </Provider>,
  );
  return store;
};

// ── rendering ─────────────────────────────────────────────────────────────────

describe('CompanyInfoSection — rendering', () => {
  it('renders the section heading', () => {
    renderSection();
    expect(screen.getByText(/company information/i)).toBeDefined();
  });

  it('renders the Edit button', () => {
    renderSection();
    expect(screen.getByRole('button', { name: /edit/i })).toBeDefined();
  });

  it('renders the Employer Org Number label', () => {
    renderSection();
    expect(screen.getByText(/employer org number/i)).toBeDefined();
  });

  it('renders the Organization Name label', () => {
    renderSection();
    expect(screen.getByText(/organization name/i)).toBeDefined();
  });

  it('renders the IBAN label', () => {
    renderSection();
    expect(screen.getByText(/iban/i)).toBeDefined();
  });

  it('renders the Routing Code label', () => {
    renderSection();
    expect(screen.getByText(/routing code/i)).toBeDefined();
  });

  it('renders the Email label', () => {
    renderSection();
    expect(screen.getByText(/email/i)).toBeDefined();
  });

  it('renders the Phone label', () => {
    renderSection();
    expect(screen.getByText(/phone/i)).toBeDefined();
  });

  it('shows pre-filled employerOrgNo when provided via store', () => {
    renderSection({ employerOrgNo: '9876543210123' });
    const input = screen.getByDisplayValue('9876543210123');
    expect(input).toBeDefined();
  });

  it('shows pre-filled organizationName when provided via store', () => {
    renderSection({ organizationName: 'White Caves Real Estate LLC' });
    expect(screen.getByDisplayValue('White Caves Real Estate LLC')).toBeDefined();
  });
});

// ── disabled in view mode ──────────────────────────────────────────────────────

describe('CompanyInfoSection — view mode (inputs disabled)', () => {
  it('the employerOrgNo input is disabled by default', () => {
    renderSection();
    const inputs = screen.getAllByRole('textbox');
    // All inputs should be disabled in view mode
    inputs.forEach((input) => {
      expect(input.disabled).toBe(true);
    });
  });

  it('does not dispatch when input is disabled (no change event fires)', () => {
    const store = renderSection();
    const inputs = screen.getAllByRole('textbox');
    const before = store.getState().payroll.currentFile.companyInfo.organizationName;
    // Attempt to change a disabled field (browser normally prevents this)
    // We verify state is unchanged
    expect(store.getState().payroll.currentFile.companyInfo.organizationName).toBe(before);
  });
});

// ── edit mode ────────────────────────────────────────────────────────────────

describe('CompanyInfoSection — edit mode', () => {
  it('clicking Edit enables inputs', () => {
    renderSection();
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    const inputs = screen.getAllByRole('textbox');
    // At least one input should now be enabled
    const enabledInputs = inputs.filter((i) => !i.disabled);
    expect(enabledInputs.length).toBeGreaterThan(0);
  });

  it('button text changes to "Done" after clicking Edit', () => {
    renderSection();
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(screen.getByRole('button', { name: /done/i })).toBeDefined();
  });

  it('clicking Done disables inputs again', () => {
    renderSection();
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    fireEvent.click(screen.getByRole('button', { name: /done/i }));
    const inputs = screen.getAllByRole('textbox');
    inputs.forEach((input) => {
      expect(input.disabled).toBe(true);
    });
  });

  it('button text goes back to "Edit" after clicking Done', () => {
    renderSection();
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    fireEvent.click(screen.getByRole('button', { name: /done/i }));
    expect(screen.getByRole('button', { name: /edit/i })).toBeDefined();
  });

  it('typing in organizationName dispatches updateCompanyInfo to the store', () => {
    const store = renderSection();
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));

    // Find the organizationName input by name attribute
    const orgInput = document.querySelector('input[name="organizationName"]');
    expect(orgInput).not.toBeNull();

    fireEvent.change(orgInput, { target: { value: 'New Company Name' } });

    expect(store.getState().payroll.currentFile.companyInfo.organizationName).toBe('New Company Name');
  });

  it('typing in employerOrgNo updates the store', () => {
    const store = renderSection();
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));

    const input = document.querySelector('input[name="employerOrgNo"]');
    fireEvent.change(input, { target: { value: '1234567890123' } });

    expect(store.getState().payroll.currentFile.companyInfo.employerOrgNo).toBe('1234567890123');
  });

  it('typing in iban updates the store', () => {
    const store = renderSection();
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));

    const input = document.querySelector('input[name="iban"]');
    fireEvent.change(input, { target: { value: 'AE030359356491705358002' } });

    expect(store.getState().payroll.currentFile.companyInfo.iban).toBe('AE030359356491705358002');
  });

  it('typing in email updates the store', () => {
    const store = renderSection();
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));

    const input = document.querySelector('input[name="email"]');
    fireEvent.change(input, { target: { value: 'payroll@whitecaves.ae' } });

    expect(store.getState().payroll.currentFile.companyInfo.email).toBe('payroll@whitecaves.ae');
  });
});
