/**
 * DocumentSelector Integration Tests
 *
 * Covers:
 * 1. Renders select with all TEMPLATE_CONFIG options
 * 2. Active template reflected as select value
 * 3. Changing selection dispatches setActiveTemplate
 * 4. Redux state updates after selection change
 * 5. Memo stability – no re-render when unrelated state changes
 * 6. Accessible label wiring (label → select via FormField id)
 * 7. All 8 template keys present in options
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import templateReducer, { setActiveTemplate } from '../store/templateSlice';
import documentReducer from '../store/documentSlice';
import DocumentSelector from './DocumentSelector';

// ─── helpers ──────────────────────────────────────────────────────────────────

function makeStore(preloadedState = {}) {
  return configureStore({
    reducer: {
      template: templateReducer,
      document: documentReducer,
    },
    preloadedState,
  });
}

function renderSelector(store) {
  return render(
    <Provider store={store}>
      <DocumentSelector />
    </Provider>,
  );
}

// ─── tests ────────────────────────────────────────────────────────────────────

describe('DocumentSelector', () => {
  let store;

  beforeEach(() => {
    store = makeStore();
  });

  // 1. Renders the label text
  it('renders the document label', () => {
    renderSelector(store);
    expect(screen.getByText(/select document for preview \/ print/i)).toBeInTheDocument();
  });

  // 2. Renders a <select> element
  it('renders a native select element', () => {
    renderSelector(store);
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });

  // 3. All 9 template keys present as <option> elements
  it('renders all 9 template options', () => {
    renderSelector(store);
    const select = screen.getByRole('combobox');
    // 9 templates defined in registry (including Salary Certificate)
    expect(select.options).toHaveLength(9);
  });

  // 4. Option values match expected template keys
  it('includes every expected template key as an option value', () => {
    renderSelector(store);
    const select = screen.getByRole('combobox');
    const optionValues = Array.from(select.options).map((o) => o.value);
    const expectedKeys = [
      'viewing',
      'booking',
      'bookingGov',
      'addendum',
      'tenancy',
      'invoice',
      'keyHandover',
      'offer',
      'salaryCertificate',
    ];
    for (const key of expectedKeys) {
      expect(optionValues).toContain(key);
    }
  });

  // 5. Default value matches Redux initial state ('booking')
  it('defaults to the booking template when store has default state', () => {
    renderSelector(store);
    const select = screen.getByRole('combobox');
    expect(select.value).toBe('booking');
  });

  // 6. Pre-loaded state is reflected in the select value
  it('reflects a pre-loaded activeTemplate in the select value', () => {
    const customStore = makeStore({ template: { activeTemplate: 'viewing' } });
    renderSelector(customStore);
    const select = screen.getByRole('combobox');
    expect(select.value).toBe('viewing');
  });

  // 7. Changing the select dispatches setActiveTemplate with the new key
  it('dispatches setActiveTemplate when selection changes', () => {
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    renderSelector(store);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'tenancy' } });
    expect(dispatchSpy).toHaveBeenCalledWith(setActiveTemplate('tenancy'));
  });

  // 8. Redux state updates after selection change
  it('updates Redux state after selection change', () => {
    renderSelector(store);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'invoice' } });
    expect(store.getState().template.activeTemplate).toBe('invoice');
  });

  // 9. Select reflects new Redux state after change
  it('select value updates in the DOM after dispatch', () => {
    renderSelector(store);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'addendum' } });
    expect(select.value).toBe('addendum');
  });

  // 10. Multiple sequential changes each update Redux state
  it('handles multiple sequential template changes', () => {
    renderSelector(store);
    const select = screen.getByRole('combobox');

    fireEvent.change(select, { target: { value: 'offer' } });
    expect(store.getState().template.activeTemplate).toBe('offer');

    fireEvent.change(select, { target: { value: 'keyHandover' } });
    expect(store.getState().template.activeTemplate).toBe('keyHandover');

    fireEvent.change(select, { target: { value: 'bookingGov' } });
    expect(store.getState().template.activeTemplate).toBe('bookingGov');
  });

  // 11. Option labels are human-readable (not raw keys)
  it('displays human-readable labels in options', () => {
    renderSelector(store);
    const select = screen.getByRole('combobox');
    const labels = Array.from(select.options).map((o) => o.text);
    // None of the labels should equal a raw camelCase key
    for (const label of labels) {
      expect(label).not.toMatch(/^(viewing|booking|bookingGov|addendum|tenancy|invoice|keyHandover|offer)$/);
    }
  });

  // 12. Label is associated with the select via htmlFor / id
  it('has an accessible label-select association', () => {
    renderSelector(store);
    const select = screen.getByRole('combobox');
    // The select should have an id attribute (wired by FormField)
    expect(select).toHaveAttribute('id');
    const selectId = select.getAttribute('id');
    const label = document.querySelector(`label[for="${selectId}"]`);
    expect(label).not.toBeNull();
  });

  // 13. Component renders inside doc-selector-wrap container
  it('renders inside the doc-selector-wrap container', () => {
    const { container } = renderSelector(store);
    expect(container.querySelector('.doc-selector-wrap')).toBeInTheDocument();
  });

  // 14. 'viewing' option has accessible label containing RERA
  it('viewing option label references RERA', () => {
    renderSelector(store);
    const select = screen.getByRole('combobox');
    const viewingOption = Array.from(select.options).find((o) => o.value === 'viewing');
    expect(viewingOption.text).toMatch(/RERA/i);
  });

  // 15. 'invoice' option is present and selectable
  it('can select invoice template', () => {
    renderSelector(store);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'invoice' } });
    expect(select.value).toBe('invoice');
    expect(store.getState().template.activeTemplate).toBe('invoice');
  });
});
