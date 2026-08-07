/**
 * SIFPayrollPage.test.jsx
 * Thin wrapper page — mocks all sub-components to test structure only.
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SIFPayrollPage from './SIFPayrollPage';

// ── mock all sub-components ───────────────────────────────────────────────────
vi.mock('./sif/SIFPayrollForm', () => ({ default: () => <div data-testid="mock-sif-payroll-form" /> }));

// ── structure ─────────────────────────────────────────────────────────────────

describe('SIFPayrollPage — structure', () => {
  it('renders a main element with role main', () => {
    render(<SIFPayrollPage />);
    expect(screen.getByRole('main')).toBeDefined();
  });

  it('applies workflow semantic classes on main/hero/workspace regions', () => {
    render(<SIFPayrollPage />);

    const main = screen.getByRole('main');
    expect(main).toHaveClass('sif-payroll-page');
    expect(main).toHaveClass('workflow-page');
    expect(main).toHaveClass('shell-page');

    const hero = screen.getByText(/Payroll command center/i).closest('section');
    expect(hero).toHaveClass('sif-payroll-page__hero');
    expect(hero).toHaveClass('workflow-page__header');

    const workspace = screen.getByTestId('mock-sif-payroll-form').closest('.sif-payroll-page__workspace');
    expect(workspace).not.toBeNull();
    expect(workspace).toHaveClass('workflow-page__main');
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

  it('renders the About SIF Files footer note', () => {
    render(<SIFPayrollPage />);
    expect(screen.getByText(/About SIF Files/i)).toBeDefined();
  });

  it('renders UAE Wages Protection System reference', () => {
    render(<SIFPayrollPage />);
    expect(screen.getByText(/Wages Protection System/i)).toBeDefined();
  });
});
