/**
 * [Category 1: View Test]
 * Tests for StudioStep4ReviewExport & Decomposed Step 4 Components
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import tenancyStudioReducer from '../../store/tenancyStudioSlice';
import { StudioStep4ReviewExport } from './StudioStep4ReviewExport';

const renderWithStore = (preloadedState) => {
  const store = configureStore({
    reducer: { tenancyStudio: tenancyStudioReducer },
    preloadedState,
  });
  return {
    store,
    ...render(
      <Provider store={store}>
        <StudioStep4ReviewExport />
      </Provider>,
    ),
  };
};

describe('StudioStep4ReviewExport Component', () => {
  it('renders pending status banner when no blob is compiled yet', () => {
    renderWithStore({
      tenancyStudio: {
        confirmations: { lastCompiledBlobUrl: null },
      },
    });

    expect(screen.getByText(/Ready to compile/i)).toBeInTheDocument();
  });

  it('renders success status banner when blob is compiled', () => {
    renderWithStore({
      tenancyStudio: {
        confirmations: {
          lastCompiledBlobUrl: 'blob:http://localhost/test-blob',
          lastFileName: 'White_Caves_Tenancy_Unit_101.pdf',
        },
      },
    });

    expect(screen.getByText(/Tenancy Package Ready!/i)).toBeInTheDocument();
    expect(screen.getByText('White_Caves_Tenancy_Unit_101.pdf')).toBeInTheDocument();
  });

  it('allows clicking quick-jump buttons to change active viewing page', () => {
    const { store } = renderWithStore({
      tenancyStudio: {
        activeViewingPage: 1,
        confirmations: {},
      },
    });

    const p4Btn = screen.getByRole('button', { name: /P4: RERA Addendum 1/i });
    fireEvent.click(p4Btn);

    expect(store.getState().tenancyStudio.activeViewingPage).toBe(4);
  });
});
