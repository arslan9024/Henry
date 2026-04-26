import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import documentReducer from '../store/documentSlice';
import { useDocumentForm } from './useDocumentForm';
import { defineSchema, required, email, maxLen, minLen } from '../forms/validation';

// ─── tiny store factory: just enough document slice for hook tests ───
function makeStore() {
  return configureStore({ reducer: { document: documentReducer } });
}

function wrap(store) {
  // eslint-disable-next-line react/display-name, react/prop-types
  return ({ children }) => <Provider store={store}>{children}</Provider>;
}

const schema = defineSchema({
  'tenant.fullName': [required(), minLen(2)],
  'tenant.email': [required(), email()],
  'property.unit': [required(), maxLen(40)],
});

describe('useDocumentForm', () => {
  let store;
  beforeEach(() => {
    store = makeStore();
  });

  it('throws if no schema provided', () => {
    expect(() => renderHook(() => useDocumentForm({}), { wrapper: wrap(store) })).toThrow(/schema/);
  });

  it('flattens document section.field into values map', () => {
    // The store's defaults already populate property.unit
    const { result } = renderHook(() => useDocumentForm({ schema }), {
      wrapper: wrap(store),
    });
    expect(result.current.values['property.unit']).toBe('Unit 449');
    expect(result.current.values['tenant.fullName']).toBe('');
  });

  it('errors are computed but visibleErrors hidden until touched/submitted', () => {
    const { result } = renderHook(() => useDocumentForm({ schema }), {
      wrapper: wrap(store),
    });
    // tenant.email is empty → required() fires
    expect(result.current.errors['tenant.email']).toBe('Required');
    // but the UI shouldn't see it yet
    expect(result.current.visibleErrors['tenant.email']).toBeUndefined();
    expect(result.current.isValid).toBe(false);
    expect(result.current.firstErrorPath).toBe('tenant.fullName');
  });

  it('blur (onBlur) marks field touched and reveals its error', () => {
    const { result } = renderHook(() => useDocumentForm({ schema }), {
      wrapper: wrap(store),
    });
    act(() => result.current.fieldProps('tenant.email').onBlur());
    expect(result.current.touched['tenant.email']).toBe(true);
    expect(result.current.visibleErrors['tenant.email']).toBe('Required');
    // other fields' errors stay hidden
    expect(result.current.visibleErrors['tenant.fullName']).toBeUndefined();
  });

  it('fieldProps.onChange dispatches setDocumentValue and marks dirty', () => {
    const { result } = renderHook(() => useDocumentForm({ schema }), {
      wrapper: wrap(store),
    });
    act(() =>
      result.current.fieldProps('tenant.fullName').onChange({
        target: { value: 'Henry Tenant' },
      }),
    );
    expect(store.getState().document.tenant.fullName).toBe('Henry Tenant');
    expect(result.current.dirty['tenant.fullName']).toBe(true);
    expect(result.current.values['tenant.fullName']).toBe('Henry Tenant');
    expect(result.current.errors['tenant.fullName']).toBeUndefined();
  });

  it('fieldProps.onChange accepts raw value (no event) for Checkbox/Radio style', () => {
    const { result } = renderHook(() => useDocumentForm({ schema }), {
      wrapper: wrap(store),
    });
    act(() => result.current.fieldProps('tenant.fullName').onChange('Direct'));
    expect(store.getState().document.tenant.fullName).toBe('Direct');
  });

  it('fieldProps supports custom extract for Checkbox.target.checked pattern', () => {
    const { result } = renderHook(() => useDocumentForm({ schema }), {
      wrapper: wrap(store),
    });
    act(() =>
      result.current
        .fieldProps('tenant.fullName', { extract: (e) => e.target.checked })
        .onChange({ target: { checked: true } }),
    );
    expect(store.getState().document.tenant.fullName).toBe(true);
  });

  it('validate({force:true}) reveals every error', () => {
    const { result } = renderHook(() => useDocumentForm({ schema }), {
      wrapper: wrap(store),
    });
    let outcome;
    act(() => {
      outcome = result.current.validate({ force: true });
    });
    expect(outcome.isValid).toBe(false);
    expect(result.current.submitted).toBe(true);
    expect(result.current.visibleErrors['tenant.fullName']).toBe('Required');
    expect(result.current.visibleErrors['tenant.email']).toBe('Required');
  });

  it('submit short-circuits when invalid, runs handler when valid', async () => {
    const { result } = renderHook(() => useDocumentForm({ schema }), {
      wrapper: wrap(store),
    });
    let invalidOutcome;
    await act(async () => {
      invalidOutcome = await result.current.submit(() => 'should not run');
    });
    expect(invalidOutcome.isValid).toBe(false);
    expect(invalidOutcome.result).toBeUndefined();

    // Now fill the form
    act(() => result.current.fieldProps('tenant.fullName').onChange({ target: { value: 'Henry' } }));
    act(() => result.current.fieldProps('tenant.email').onChange({ target: { value: 'h@x.io' } }));

    let validOutcome;
    await act(async () => {
      validOutcome = await result.current.submit((vals) => ({
        savedAs: vals['tenant.email'],
      }));
    });
    expect(validOutcome.isValid).toBe(true);
    expect(validOutcome.result).toEqual({ savedAs: 'h@x.io' });
    expect(result.current.isSubmitting).toBe(false);
  });

  it('reset clears touched/dirty/submitted but leaves Redux values intact', () => {
    const { result } = renderHook(() => useDocumentForm({ schema }), {
      wrapper: wrap(store),
    });
    act(() => result.current.fieldProps('tenant.fullName').onChange({ target: { value: 'Henry' } }));
    act(() => result.current.fieldProps('tenant.email').onBlur());
    act(() => result.current.validate({ force: true }));
    expect(result.current.dirty['tenant.fullName']).toBe(true);
    expect(result.current.touched['tenant.email']).toBe(true);
    expect(result.current.submitted).toBe(true);

    act(() => result.current.reset());

    expect(result.current.dirty).toEqual({});
    expect(result.current.touched).toEqual({});
    expect(result.current.submitted).toBe(false);
    // Redux value preserved
    expect(store.getState().document.tenant.fullName).toBe('Henry');
  });

  it('throws on malformed path (no dot)', () => {
    const { result } = renderHook(() => useDocumentForm({ schema }), {
      wrapper: wrap(store),
    });
    expect(() => result.current.setValue('badpath', 'x')).toThrow(/section\.field/);
  });
});
