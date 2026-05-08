/**
 * useDocumentData.test.jsx
 * Tests for src/hooks/useDocumentData — thin selector hook that returns
 * the full document slice from the Redux store.
 */
import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { useDocumentData } from '../hooks/useDocumentData';
import documentReducer from '../store/documentSlice';

// ── factory ───────────────────────────────────────────────────────────────────

const makeStore = (preloadedState = {}) =>
  configureStore({
    reducer: { document: documentReducer },
    preloadedState,
  });

const makeWrapper = (store) =>
  function Wrapper({ children }) {
    return <Provider store={store}>{children}</Provider>;
  };

// ── tests ─────────────────────────────────────────────────────────────────────

describe('useDocumentData', () => {
  it('returns an object (the document slice)', () => {
    const store = makeStore();
    const { result } = renderHook(() => useDocumentData(), { wrapper: makeWrapper(store) });
    expect(result.current).toBeDefined();
    expect(typeof result.current).toBe('object');
  });

  it('returns the default company name', () => {
    const store = makeStore();
    const { result } = renderHook(() => useDocumentData(), { wrapper: makeWrapper(store) });
    expect(result.current.company?.name).toBe('White Caves Real Estate L.L.C');
  });

  it('returns property data from the slice', () => {
    const store = makeStore();
    const { result } = renderHook(() => useDocumentData(), { wrapper: makeWrapper(store) });
    expect(result.current.property).toBeDefined();
    expect(typeof result.current.property.unit).toBe('string');
  });

  it('reflects preloaded company name', () => {
    const store = makeStore({
      document: {
        company: { name: 'Test Realty', dedLicense: '000', role: 'Agent', city: 'Abu Dhabi' },
        property: {
          referenceNo: 'TEST/001',
          documentDate: '',
          unit: 'Unit 1',
          cluster: '',
          community: '',
          city: '',
          description: '',
          size: '',
          parking: '',
          condition: '',
          usage: '',
          plotNo: '',
          makaniNo: '',
          dewaPremisesNo: '',
          projectName: '',
          buildingNumber: '',
          ownersAssociationNo: '',
        },
      },
    });
    const { result } = renderHook(() => useDocumentData(), { wrapper: makeWrapper(store) });
    expect(result.current.company.name).toBe('Test Realty');
    expect(result.current.property.unit).toBe('Unit 1');
  });

  it('returns the same reference on re-render when state unchanged', () => {
    const store = makeStore();
    const { result, rerender } = renderHook(() => useDocumentData(), {
      wrapper: makeWrapper(store),
    });
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });
});
