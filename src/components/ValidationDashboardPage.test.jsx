import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen } from '@testing-library/react';
import documentReducer from '../store/documentSlice';
import archiveReducer from '../store/archiveSlice';
import ValidationDashboardPage, { evaluateActiveRecord } from './ValidationDashboardPage';

vi.mock('../hooks/useAppNavigation', () => ({ default: () => ({ goToPage: vi.fn() }) }));

const renderPage = () => {
  const store = configureStore({ reducer: { document: documentReducer, archive: archiveReducer } });
  return render(
    <Provider store={store}>
      <ValidationDashboardPage />
    </Provider>,
  );
};

describe('ValidationDashboardPage', () => {
  it('identifies exact missing fields on an active record', () => {
    const result = evaluateActiveRecord({
      property: { unit: '101' },
      tenant: {},
      landlord: {},
      payments: {},
    });
    expect(result.status).toBe('incomplete');
    expect(result.missing).toContainEqual({ path: 'tenant.fullName', label: 'Tenant name' });
    expect(result.label).toMatch(/101/);
  });

  it('renders and filters incomplete records', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /validation dashboard/i })).toBeInTheDocument();
    expect(screen.getByText(/landlord phone/i)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'ready' } });
    expect(screen.getByText(/no matching records/i)).toBeInTheDocument();
  });
});
