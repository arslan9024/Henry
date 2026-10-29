import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import tenancyStudioReducer from '../../store/tenancyStudioSlice';
import ContractDiffModal from './ContractDiffModal';

const createStore = () =>
  configureStore({
    reducer: {
      tenancyStudio: tenancyStudioReducer,
    },
    preloadedState: {
      tenancyStudio: {
        page1: {
          tenant_name: 'Ahmed Al Mansoori',
          date_from: '01-10-2025',
          date_to: '30-09-2026',
          annual_rent: '130,000',
        },
      },
    },
  });

describe('ContractDiffModal', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <Provider store={createStore()}>
        <ContractDiffModal isOpen={false} onClose={vi.fn()} />
      </Provider>,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders comparison table and applies renewal updates when open', () => {
    const store = createStore();
    const handleClose = vi.fn();
    render(
      <Provider store={store}>
        <ContractDiffModal isOpen={true} onClose={handleClose} />
      </Provider>,
    );

    expect(screen.getByText(/Previous Contract vs. Renewal Comparison Diff/i)).toBeInTheDocument();
    expect(screen.getByText(/01-10-2025/i)).toBeInTheDocument();

    const applyBtn = screen.getByRole('button', { name: /apply renewal/i });
    fireEvent.click(applyBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
    // Verified +1 year renewal updated in store
    expect(store.getState().tenancyStudio.page1.date_from).toBe('01-10-2026');
    expect(store.getState().tenancyStudio.page1.date_to).toBe('30-09-2027');
  });
});
