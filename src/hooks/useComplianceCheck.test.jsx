/**
 * useComplianceCheck.test.jsx
 * Tests for src/hooks/useComplianceCheck — returns
 * { activeTemplate, warnings, summary, hasWarnings }.
 */
import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { useComplianceCheck } from '../hooks/useComplianceCheck';
import templateReducer from '../store/templateSlice';
import complianceReducer, { setWarningsForTemplate } from '../store/complianceSlice';

// ── factory ───────────────────────────────────────────────────────────────────

const makeStore = (preloadedState = {}) =>
  configureStore({
    reducer: {
      template: templateReducer,
      compliance: complianceReducer,
    },
    preloadedState,
  });

const makeWrapper = (store) =>
  function Wrapper({ children }) {
    return <Provider store={store}>{children}</Provider>;
  };

const WARNING_CRITICAL = { id: 'W1', message: 'Missing passport copy', severity: 'critical' };
const WARNING_IMPORTANT = { id: 'W2', message: 'No deposit receipt', severity: 'important' };
const WARNING_INFO = { id: 'W3', message: 'Review RERA clause 7', severity: 'info' };

// ── empty state ───────────────────────────────────────────────────────────────

describe('useComplianceCheck — no warnings', () => {
  it('warnings is an empty array by default', () => {
    const store = makeStore();
    const { result } = renderHook(() => useComplianceCheck(), { wrapper: makeWrapper(store) });
    expect(result.current.warnings).toEqual([]);
  });

  it('hasWarnings is false when no warnings', () => {
    const store = makeStore();
    const { result } = renderHook(() => useComplianceCheck(), { wrapper: makeWrapper(store) });
    expect(result.current.hasWarnings).toBe(false);
  });

  it('summary counts are all zero by default', () => {
    const store = makeStore();
    const { result } = renderHook(() => useComplianceCheck(), { wrapper: makeWrapper(store) });
    expect(result.current.summary).toEqual({ critical: 0, important: 0, info: 0 });
  });

  it('returns the active template key', () => {
    const store = makeStore({ template: { activeTemplate: 'viewing' } });
    const { result } = renderHook(() => useComplianceCheck(), { wrapper: makeWrapper(store) });
    expect(result.current.activeTemplate).toBe('viewing');
  });
});

// ── with warnings ─────────────────────────────────────────────────────────────

describe('useComplianceCheck — with warnings', () => {
  it('returns warnings for the active template', () => {
    const store = makeStore({ template: { activeTemplate: 'booking' } });
    store.dispatch(setWarningsForTemplate({ templateKey: 'booking', warnings: [WARNING_CRITICAL] }));
    const { result } = renderHook(() => useComplianceCheck(), { wrapper: makeWrapper(store) });
    expect(result.current.warnings).toHaveLength(1);
    expect(result.current.warnings[0].id).toBe('W1');
  });

  it('hasWarnings is true when warnings present', () => {
    const store = makeStore({ template: { activeTemplate: 'booking' } });
    store.dispatch(setWarningsForTemplate({ templateKey: 'booking', warnings: [WARNING_IMPORTANT] }));
    const { result } = renderHook(() => useComplianceCheck(), { wrapper: makeWrapper(store) });
    expect(result.current.hasWarnings).toBe(true);
  });

  it('summary counts critical severity', () => {
    const store = makeStore({ template: { activeTemplate: 'booking' } });
    store.dispatch(setWarningsForTemplate({ templateKey: 'booking', warnings: [WARNING_CRITICAL] }));
    const { result } = renderHook(() => useComplianceCheck(), { wrapper: makeWrapper(store) });
    expect(result.current.summary.critical).toBe(1);
    expect(result.current.summary.important).toBe(0);
    expect(result.current.summary.info).toBe(0);
  });

  it('summary counts important severity', () => {
    const store = makeStore({ template: { activeTemplate: 'booking' } });
    store.dispatch(setWarningsForTemplate({ templateKey: 'booking', warnings: [WARNING_IMPORTANT] }));
    const { result } = renderHook(() => useComplianceCheck(), { wrapper: makeWrapper(store) });
    expect(result.current.summary.important).toBe(1);
  });

  it('summary counts info severity', () => {
    const store = makeStore({ template: { activeTemplate: 'booking' } });
    store.dispatch(setWarningsForTemplate({ templateKey: 'booking', warnings: [WARNING_INFO] }));
    const { result } = renderHook(() => useComplianceCheck(), { wrapper: makeWrapper(store) });
    expect(result.current.summary.info).toBe(1);
  });

  it('summary accumulates mixed severities', () => {
    const store = makeStore({ template: { activeTemplate: 'tenancy' } });
    store.dispatch(
      setWarningsForTemplate({
        templateKey: 'tenancy',
        warnings: [WARNING_CRITICAL, WARNING_CRITICAL, WARNING_IMPORTANT, WARNING_INFO],
      }),
    );
    const { result } = renderHook(() => useComplianceCheck(), { wrapper: makeWrapper(store) });
    expect(result.current.summary).toEqual({ critical: 2, important: 1, info: 1 });
  });

  it('does not return warnings for a different template', () => {
    const store = makeStore({ template: { activeTemplate: 'booking' } });
    store.dispatch(setWarningsForTemplate({ templateKey: 'viewing', warnings: [WARNING_CRITICAL] }));
    const { result } = renderHook(() => useComplianceCheck(), { wrapper: makeWrapper(store) });
    expect(result.current.warnings).toEqual([]);
    expect(result.current.hasWarnings).toBe(false);
  });
});

// ── reactivity ────────────────────────────────────────────────────────────────

describe('useComplianceCheck — reactivity', () => {
  it('updates when warnings are added after mount', () => {
    const store = makeStore({ template: { activeTemplate: 'booking' } });
    const { result } = renderHook(() => useComplianceCheck(), { wrapper: makeWrapper(store) });

    expect(result.current.hasWarnings).toBe(false);

    act(() => {
      store.dispatch(setWarningsForTemplate({ templateKey: 'booking', warnings: [WARNING_CRITICAL] }));
    });

    expect(result.current.hasWarnings).toBe(true);
    expect(result.current.warnings).toHaveLength(1);
  });
});
