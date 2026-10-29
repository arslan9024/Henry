/**
 * [Category 1: View Test]
 * Tests for DocumentVaultModal & Decomposed Vault Components
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import documentVaultReducer from '../../store/documentVaultSlice';
import { DocumentVaultModal } from './DocumentVaultModal';

const renderWithStore = (preloadedState) => {
  const store = configureStore({
    reducer: { documentVault: documentVaultReducer },
    preloadedState,
  });
  return {
    store,
    ...render(
      <Provider store={store}>
        <DocumentVaultModal />
      </Provider>,
    ),
  };
};

describe('DocumentVaultModal & Sub-components', () => {
  it('renders nothing when isVaultModalOpen is false', () => {
    const { container } = renderWithStore({
      documentVault: { isVaultModalOpen: false },
    });
    expect(container.firstChild).toBeNull();
  });

  it('renders modal dialog and documents when open', () => {
    renderWithStore({
      documentVault: {
        isVaultModalOpen: true,
        documents: [
          { id: 'doc-1', title: 'Ejari Contract Unit 101', propertyNo: '101', tenantName: 'John Doe' },
        ],
        searchQuery: '',
      },
    });

    expect(screen.getByRole('dialog', { name: /White Caves Document Vault/i })).toBeInTheDocument();
    expect(screen.getByText('Ejari Contract Unit 101')).toBeInTheDocument();
    expect(screen.getByText(/Tenant: John Doe/i)).toBeInTheDocument();
  });

  it('filters documents when search query is entered', () => {
    const { store } = renderWithStore({
      documentVault: {
        isVaultModalOpen: true,
        documents: [
          { id: 'doc-1', title: 'Ejari Contract Unit 101', propertyNo: '101', tenantName: 'John Doe' },
          { id: 'doc-2', title: 'Receipt Unit 202', propertyNo: '202', tenantName: 'Jane Smith' },
        ],
        searchQuery: '',
      },
    });

    const searchInput = screen.getByPlaceholderText(/Search vault by Tenant, Unit, or Title/i);
    fireEvent.change(searchInput, { target: { value: 'Jane' } });

    expect(store.getState().documentVault.searchQuery).toBe('Jane');
  });
});
