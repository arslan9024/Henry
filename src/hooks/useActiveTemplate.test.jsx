/**
 * useActiveTemplate.test.jsx
 * Tests for src/hooks/useActiveTemplate — dispatches setActiveTemplate,
 * returns { activeTemplate, activeTemplateLabel, onChangeTemplate }.
 */
import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { useActiveTemplate } from '../hooks/useActiveTemplate';
import templateReducer from '../store/templateSlice';
import sidebarReducer from '../store/sidebarSlice';

// ── factory ───────────────────────────────────────────────────────────────────

const makeStore = (preloadedState = {}) =>
  configureStore({
    reducer: {
      template: templateReducer,
      sidebar: sidebarReducer,
    },
    preloadedState,
  });

const makeWrapper = (store) =>
  function Wrapper({ children }) {
    return <Provider store={store}>{children}</Provider>;
  };

// ── defaults ──────────────────────────────────────────────────────────────────

describe('useActiveTemplate — defaults', () => {
  it('returns activeTemplate matching the store initial state', () => {
    const store = makeStore();
    const { result } = renderHook(() => useActiveTemplate(), { wrapper: makeWrapper(store) });
    expect(result.current.activeTemplate).toBe('booking');
  });

  it('returns a string activeTemplateLabel', () => {
    const store = makeStore();
    const { result } = renderHook(() => useActiveTemplate(), { wrapper: makeWrapper(store) });
    expect(typeof result.current.activeTemplateLabel).toBe('string');
    expect(result.current.activeTemplateLabel.length).toBeGreaterThan(0);
  });

  it('label matches the TEMPLATE_MAP entry for the active template', () => {
    const store = makeStore({ template: { activeTemplate: 'viewing' } });
    const { result } = renderHook(() => useActiveTemplate(), { wrapper: makeWrapper(store) });
    expect(result.current.activeTemplateLabel).toBe('Property Viewing Agreement (DLD/RERA P210)');
  });

  it('returns an onChangeTemplate function', () => {
    const store = makeStore();
    const { result } = renderHook(() => useActiveTemplate(), { wrapper: makeWrapper(store) });
    expect(typeof result.current.onChangeTemplate).toBe('function');
  });
});

// ── onChangeTemplate ──────────────────────────────────────────────────────────

describe('useActiveTemplate — onChangeTemplate', () => {
  it('updates activeTemplate in the store', () => {
    const store = makeStore();
    const { result } = renderHook(() => useActiveTemplate(), { wrapper: makeWrapper(store) });

    act(() => {
      result.current.onChangeTemplate('addendum');
    });

    expect(result.current.activeTemplate).toBe('addendum');
  });

  it('updates activeTemplateLabel after switching template', () => {
    const store = makeStore();
    const { result } = renderHook(() => useActiveTemplate(), { wrapper: makeWrapper(store) });

    act(() => {
      result.current.onChangeTemplate('invoice');
    });

    expect(result.current.activeTemplateLabel).toContain('Invoice');
  });

  it('successive changes are reflected', () => {
    const store = makeStore();
    const { result } = renderHook(() => useActiveTemplate(), { wrapper: makeWrapper(store) });

    act(() => result.current.onChangeTemplate('viewing'));
    expect(result.current.activeTemplate).toBe('viewing');

    act(() => result.current.onChangeTemplate('booking'));
    expect(result.current.activeTemplate).toBe('booking');
  });

  it('store state is updated on dispatch', () => {
    const store = makeStore();
    const { result } = renderHook(() => useActiveTemplate(), { wrapper: makeWrapper(store) });

    act(() => result.current.onChangeTemplate('keyHandover'));

    expect(store.getState().template.activeTemplate).toBe('keyHandover');
  });
});

// ── stability ─────────────────────────────────────────────────────────────────

describe('useActiveTemplate — function stability', () => {
  it('onChangeTemplate reference is stable (memoized)', () => {
    const store = makeStore();
    const { result, rerender } = renderHook(() => useActiveTemplate(), {
      wrapper: makeWrapper(store),
    });

    const first = result.current.onChangeTemplate;
    rerender();
    expect(result.current.onChangeTemplate).toBe(first);
  });
});
