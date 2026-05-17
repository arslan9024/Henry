/**
 * SIFPayrollPage.test.jsx
 * Thin wrapper page — mocks all sub-components to test structure only.
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SIFPayrollPage from './SIFPayrollPage';

// ── mock all sub-components ───────────────────────────────────────────────────
vi.mock('./TopNavbar', () => ({ default: () => <div data-testid="mock-top-navbar" /> }));
vi.mock('./ToastHost', () => ({ default: () => <div data-testid="mock-toast-host" /> }));
vi.mock('./SkipLink', () => ({
  default: () => (
    <a data-testid="mock-skip-link" href="#main">
      Skip
    </a>
  ),
}));
vi.mock('./CommandPalette', () => ({ default: () => <div data-testid="mock-command-palette" /> }));
vi.mock('./sif/SIFPayrollForm', () => ({ default: () => <div data-testid="mock-sif-payroll-form" /> }));
vi.mock('../hooks/useAutosaveDebounce', () => ({ default: vi.fn() }));

// ── structure ─────────────────────────────────────────────────────────────────

describe('SIFPayrollPage — structure', () => {
  it('renders a main element with role main', () => {
    render(<SIFPayrollPage />);
    expect(screen.getByRole('main')).toBeDefined();
  });

  it('renders the page heading "WPS Salary File Generator"', () => {
    render(<SIFPayrollPage />);
    expect(screen.getByRole('heading', { name: /WPS Salary File Generator/i })).toBeDefined();
  });

  it('renders the subtitle about Mashreq bank-compatible files', () => {
    render(<SIFPayrollPage />);
    expect(screen.getByText(/Mashreq bank-compatible/i)).toBeDefined();
  });

  it('renders the SIFPayrollForm', () => {
    render(<SIFPayrollPage />);
    expect(screen.getByTestId('mock-sif-payroll-form')).toBeDefined();
  });

  it('renders the TopNavbar', () => {
    render(<SIFPayrollPage />);
    expect(screen.getByTestId('mock-top-navbar')).toBeDefined();
  });

  it('renders the SkipLink', () => {
    render(<SIFPayrollPage />);
    expect(screen.getByTestId('mock-skip-link')).toBeDefined();
  });

  it('renders the ToastHost', () => {
    render(<SIFPayrollPage />);
    expect(screen.getByTestId('mock-toast-host')).toBeDefined();
  });

  it('renders the CommandPalette', () => {
    render(<SIFPayrollPage />);
    expect(screen.getByTestId('mock-command-palette')).toBeDefined();
  });

  it('renders the About SIF Files footer note', () => {
    render(<SIFPayrollPage />);
    expect(screen.getByText(/About SIF Files/i)).toBeDefined();
  });

  it('renders UAE Wages Protection System reference', () => {
    render(<SIFPayrollPage />);
    expect(screen.getByText(/Wages Protection System/i)).toBeDefined();
  });
});
