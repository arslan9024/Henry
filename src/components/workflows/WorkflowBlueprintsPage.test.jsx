/**
 * [Category 1: View Test]
 * Unit test for WorkflowBlueprintsPage.jsx (< 80 lines).
 */

import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import WorkflowBlueprintsPage from './WorkflowBlueprintsPage';

afterEach(cleanup);

describe('WorkflowBlueprintsPage', () => {
  it('renders page header and filter buttons', () => {
    render(<WorkflowBlueprintsPage />);
    expect(screen.getByText(/Enterprise Workflows & Flowcharts/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search flowcharts & scenarios/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Leasing Workflows' })).toBeInTheDocument();
  });

  it('filters cards by search query', () => {
    render(<WorkflowBlueprintsPage />);
    const searchInput = screen.getByPlaceholderText(/Search flowcharts & scenarios/i);
    fireEvent.change(searchInput, { target: { value: 'SIF Payroll' } });

    expect(screen.getByText(/WPS SIF Payroll Operations Flow/i)).toBeInTheDocument();
    expect(screen.queryByText(/Tenancy Contract, RERA Addendum/i)).toBeNull();
  });

  it('opens and closes modal on inspect click', () => {
    render(<WorkflowBlueprintsPage />);
    const inspectBtns = screen.getAllByRole('button', { name: /Inspect Blueprint/i });
    fireEvent.click(inspectBtns[0]);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Close dialog/i }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
