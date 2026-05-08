/**
 * HenryOperationsPanel.test.jsx
 * Redux-connected panel for live field editing (tenant, renewal, occupancy, eviction).
 * Uses documentSlice via dispatch(setDocumentValue({ section, field, value })).
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import HenryOperationsPanel from './HenryOperationsPanel';
import documentReducer from '../store/documentSlice';

// ── store factory ─────────────────────────────────────────────────────────────
// Use documentReducer's own initialState by omitting preloadedState for document.

const makeStore = () =>
  configureStore({
    reducer: { document: documentReducer },
  });

const renderPanel = () => {
  const store = makeStore();
  return {
    store,
    ...render(
      <Provider store={store}>
        <HenryOperationsPanel />
      </Provider>,
    ),
  };
};

// ── structure ─────────────────────────────────────────────────────────────────

describe('HenryOperationsPanel — structure', () => {
  it('renders a section with aria-label "Henry operations quick editor"', () => {
    renderPanel();
    expect(screen.getByRole('region', { name: /Henry operations quick editor/i })).toBeDefined();
  });

  it('renders "Operations Quick Edit" heading', () => {
    renderPanel();
    expect(screen.getByRole('heading', { name: /Operations Quick Edit/i })).toBeDefined();
  });

  it('renders a toggle button', () => {
    renderPanel();
    expect(screen.getByRole('button', { name: /Show editor fields/i })).toBeDefined();
  });

  it('button starts with aria-expanded="false"', () => {
    renderPanel();
    const btn = screen.getByRole('button', { name: /Show editor fields|Hide editor fields/i });
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });
});

// ── toggle behaviour ──────────────────────────────────────────────────────────

describe('HenryOperationsPanel — toggle', () => {
  it('button text changes to "Hide editor fields" after click', () => {
    renderPanel();
    fireEvent.click(screen.getByRole('button', { name: /Show editor fields/i }));
    expect(screen.getByRole('button', { name: /Hide editor fields/i })).toBeDefined();
  });

  it('aria-expanded becomes "true" after click', () => {
    renderPanel();
    const btn = screen.getByRole('button', { name: /Show editor fields/i });
    fireEvent.click(btn);
    expect(btn.getAttribute('aria-expanded')).toBe('true');
  });

  it('collapses back when clicked a second time', () => {
    renderPanel();
    const btn = screen.getByRole('button', { name: /Show editor fields/i });
    fireEvent.click(btn);
    fireEvent.click(btn);
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });
});

// ── fields rendered ───────────────────────────────────────────────────────────

describe('HenryOperationsPanel — fields', () => {
  it('renders a "Tenant Full Name" label', () => {
    renderPanel();
    expect(screen.getByText('Tenant Full Name')).toBeDefined();
  });

  it('renders a "Tenant Emirates ID" label', () => {
    renderPanel();
    expect(screen.getByText('Tenant Emirates ID')).toBeDefined();
  });

  it('renders a "Contract Start Date" label', () => {
    renderPanel();
    expect(screen.getByText('Contract Start Date')).toBeDefined();
  });

  it('renders a "Renewal Date" label', () => {
    renderPanel();
    expect(screen.getByText('Renewal Date')).toBeDefined();
  });

  it('renders a "Shared Housing" checkbox label', () => {
    renderPanel();
    expect(screen.getByText('Shared Housing')).toBeDefined();
  });

  it('renders an "Eviction Reason" label', () => {
    renderPanel();
    expect(screen.getByText('Eviction Reason')).toBeDefined();
  });
});

// ── Redux dispatch ────────────────────────────────────────────────────────────

describe('HenryOperationsPanel — dispatch', () => {
  it('dispatches setDocumentValue when tenant name input changes', () => {
    const { store } = renderPanel();
    // Find the Tenant Full Name input (first textbox associated with that label)
    const inputs = screen.getAllByRole('textbox');
    // The first input should be Tenant Full Name
    fireEvent.change(inputs[0], { target: { value: 'New Tenant' } });
    expect(store.getState().document.tenant.fullName).toBe('New Tenant');
  });

  it('dispatches setDocumentValue when renewal date input changes', () => {
    const { store } = renderPanel();
    const inputs = screen.getAllByRole('textbox');
    // Renewal Date is 4th text input (fullName, emiratesId, contractStartDate, renewalDate)
    fireEvent.change(inputs[3], { target: { value: '2028-04-30' } });
    expect(store.getState().document.renewal.renewalDate).toBe('2028-04-30');
  });

  it('dispatches setDocumentValue when Shared Housing checkbox changes', () => {
    const { store } = renderPanel();
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    // isSharedHousing flips from false to true
    expect(store.getState().document.occupancy.isSharedHousing).toBe(true);
  });
});
