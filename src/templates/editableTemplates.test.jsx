import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import documentReducer from '../store/documentSlice';
import TenancyContractTemplate from './TenancyContractTemplate';
import AddendumTemplate from './AddendumTemplate';

const makeStore = () =>
  configureStore({
    reducer: {
      document: documentReducer,
    },
  });

const renderWithStore = (ui) => {
  const store = makeStore();
  const view = render(<Provider store={store}>{ui}</Provider>);
  return { ...view, store };
};

afterEach(cleanup);

describe('Editable templates regression', () => {
  it('TenancyContractTemplate updates property.unit from the Property Details section', async () => {
    const user = userEvent.setup();
    const { store } = renderWithStore(<TenancyContractTemplate />);

    // Disclosure starts collapsed by default; open it first.
    await user.click(screen.getByRole('button', { name: /Property Details/i }));

    const unitInput = screen.getByLabelText(/Unit No\./i);
    await user.clear(unitInput);
    await user.type(unitInput, 'Villa 902A');

    expect(store.getState().document.property.unit).toBe('Villa 902A');
  });

  it('TenancyContractTemplate additional terms can be added and removed', async () => {
    const user = userEvent.setup();
    const { store } = renderWithStore(<TenancyContractTemplate />);

    await user.click(screen.getByRole('button', { name: /Additional Terms/i }));

    const termInput = screen.getByLabelText(/New Term/i);
    await user.type(termInput, 'Tenant agrees to monthly AC filter cleaning.');
    await user.click(screen.getByRole('button', { name: /\+ Add Term/i }));

    expect(store.getState().document.tenancy.additionalTerms).toEqual([
      'Tenant agrees to monthly AC filter cleaning.',
    ]);

    await user.click(screen.getByRole('button', { name: /Remove term 1/i }));
    expect(store.getState().document.tenancy.additionalTerms).toEqual([]);
  });

  it('AddendumTemplate updates original contract reference', async () => {
    const user = userEvent.setup();
    const { store } = renderWithStore(<AddendumTemplate />);

    // Section 1 is defaultOpen; no click needed.
    const refInput = screen.getByLabelText(/Original Contract Ref\./i);
    await user.clear(refInput);
    await user.type(refInput, 'WC-TC-2026-987');

    expect(store.getState().document.addendum.originalContractRef).toBe('WC-TC-2026-987');
  });

  it('AddendumTemplate keeps policy-fixed sections as read-only prose', async () => {
    const user = userEvent.setup();
    renderWithStore(<AddendumTemplate />);

    // We render this badge for each locked section (2 through 6).
    expect(screen.getAllByText(/Policy fixed/i).length).toBeGreaterThanOrEqual(5);

    // Locked values are shown in text, not editable form fields.
    await user.click(screen.getByRole('button', { name: /2\. Security Deposit/i }));
    expect(screen.getByText(/AED 4,000/i)).toBeInTheDocument();

    // Ensure policy-fixed values are not exposed as editable inputs.
    expect(screen.queryByRole('spinbutton', { name: /Security Deposit/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /3\. Renewal Charges/i }));
    expect(screen.getByText(/AED 1,050/i)).toBeInTheDocument();
    expect(screen.queryByRole('spinbutton', { name: /Renewal Charges/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /6\. RERA Compliance/i }));
    expect(screen.getAllByText(/Dubai Law No\. 26 of 2007/i).length).toBeGreaterThan(0);
    expect(screen.queryByRole('textbox', { name: /Legal Reference/i })).not.toBeInTheDocument();
  });

  it('AddendumTemplate additional clauses can be added and removed', async () => {
    const user = userEvent.setup();
    const { store } = renderWithStore(<AddendumTemplate />);

    await user.click(screen.getByRole('button', { name: /7\. Additional Agreed Clauses/i }));

    const clauseInput = screen.getByLabelText(/New Clause/i);
    await user.type(clauseInput, 'Tenant must notify landlord 48 hours before maintenance visits.');
    await user.click(screen.getByRole('button', { name: /\+ Add Clause/i }));

    expect(store.getState().document.addendum.additionalClauses).toEqual([
      'Tenant must notify landlord 48 hours before maintenance visits.',
    ]);

    await user.click(screen.getByRole('button', { name: /Remove clause 1/i }));
    expect(store.getState().document.addendum.additionalClauses).toEqual([]);
  });
});
