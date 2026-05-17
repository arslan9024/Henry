/**
 * HistoryPanel — unit tests
 *
 * Empty state → "No files generated yet"
 * Populated state → filename, date, employee count, salary, Re-download button
 * Clear All button → dispatches clearHistory (after window.confirm = true)
 */
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import payrollReducer from '../../store/payrollSlice';
import HistoryPanel from './HistoryPanel';

// ── store factory ─────────────────────────────────────────────────────────────

const makeStore = (historyRecords = []) =>
  configureStore({
    reducer: { payroll: payrollReducer },
    preloadedState: {
      payroll: {
        templates: [],
        history: historyRecords,
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

const renderPanel = (historyRecords = []) => {
  const store = makeStore(historyRecords);
  return {
    store,
    ...render(
      <Provider store={store}>
        <HistoryPanel />
      </Provider>,
    ),
  };
};

const sampleRecord = {
  id: 'gen-001',
  sifFilename: 'WPS_MAY2026.sif',
  txtFilename: 'WPS_MAY2026.txt',
  generatedAt: '2026-05-01T09:30:00.000Z',
  employeeCount: 3,
  totalSalary: 15000,
};

afterEach(() => {
  vi.restoreAllMocks();
});

// ── empty state ───────────────────────────────────────────────────────────────

describe('HistoryPanel — empty state', () => {
  it('shows "No files generated yet" when history is empty', () => {
    renderPanel([]);
    expect(screen.getByText(/no files generated yet/i)).toBeDefined();
  });

  it('shows a hint about future generated files', () => {
    renderPanel([]);
    expect(screen.getByText(/Generated SIF files will appear here/i)).toBeDefined();
  });

  it('does NOT render a Clear All button when history is empty', () => {
    renderPanel([]);
    expect(screen.queryByRole('button', { name: /clear all/i })).toBeNull();
  });
});

// ── populated state ───────────────────────────────────────────────────────────

describe('HistoryPanel — populated state', () => {
  it('shows the SIF filename', () => {
    renderPanel([sampleRecord]);
    expect(screen.getByText(/WPS_MAY2026\.sif/i)).toBeDefined();
  });

  it('shows the employee count', () => {
    renderPanel([sampleRecord]);
    expect(screen.getByText(/3 employee/i)).toBeDefined();
  });

  it('shows the total salary', () => {
    renderPanel([sampleRecord]);
    expect(screen.getByText(/15000/)).toBeDefined();
  });

  it('shows the badge with history count', () => {
    renderPanel([sampleRecord]);
    // Badge text = "1"
    expect(screen.getByText('1')).toBeDefined();
  });

  it('shows the Re-download button (disabled)', () => {
    renderPanel([sampleRecord]);
    const btn = screen.getByRole('button', { name: /re-download/i });
    expect(btn).toBeDefined();
    expect(btn.disabled).toBe(true);
  });

  it('renders a Clear All button', () => {
    renderPanel([sampleRecord]);
    expect(screen.getByRole('button', { name: /clear all/i })).toBeDefined();
  });

  it('renders multiple history items when there are multiple records', () => {
    const record2 = {
      ...sampleRecord,
      id: 'gen-002',
      sifFilename: 'WPS_APR2026.sif',
      employeeCount: 2,
      totalSalary: 9000,
    };
    renderPanel([sampleRecord, record2]);
    expect(screen.getByText(/WPS_MAY2026\.sif/i)).toBeDefined();
    expect(screen.getByText(/WPS_APR2026\.sif/i)).toBeDefined();
  });
});

// ── Clear All interaction ─────────────────────────────────────────────────────

describe('HistoryPanel — Clear All', () => {
  it('dispatches clearHistory when user confirms', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { store } = renderPanel([sampleRecord]);
    fireEvent.click(screen.getByRole('button', { name: /clear all/i }));
    expect(store.getState().payroll.history).toHaveLength(0);
  });

  it('does NOT clear history when user cancels', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const { store } = renderPanel([sampleRecord]);
    fireEvent.click(screen.getByRole('button', { name: /clear all/i }));
    expect(store.getState().payroll.history).toHaveLength(1);
  });
});
