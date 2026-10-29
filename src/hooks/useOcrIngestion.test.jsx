/**
 * [Category 2: Test]
 * Tests for useOcrIngestion hook
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import React from 'react';
import { configureStore } from '@reduxjs/toolkit';
import tenancyStudioReducer from '../store/tenancyStudioSlice';
import { useOcrIngestion } from './useOcrIngestion';

const createWrapper = () => {
  const store = configureStore({
    reducer: { tenancyStudio: tenancyStudioReducer },
  });
  return {
    store,
    wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
  };
};

describe('useOcrIngestion Hook', () => {
  it('initializes with empty ingestionStatus', () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useOcrIngestion(), { wrapper });
    expect(result.current.ingestionStatus).toBe('');
  });

  it('detects Emirates ID string from uploaded file text', async () => {
    const { store, wrapper } = createWrapper();
    const { result } = renderHook(() => useOcrIngestion(), { wrapper });

    const mockFile = {
      name: 'emirates_id.txt',
      text: vi.fn().mockResolvedValue('Tenant: John Doe\nEmirates ID: 784-1990-1234567-1\nExpiry: 2028'),
    };

    await act(async () => {
      await result.current.processFile(mockFile);
    });

    expect(result.current.ingestionStatus).toContain('784-1990-1234567-1');
    expect(store.getState().tenancyStudio.page1.tenant_eid).toBe('784-1990-1234567-1');
  });
});
