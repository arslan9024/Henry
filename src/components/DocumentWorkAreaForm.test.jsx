import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import DocumentWorkAreaForm from './DocumentWorkAreaForm';
import templateReducer from '../store/templateSlice';
import documentReducer from '../store/documentSlice';

const makeStore = (preloadedState = {}) =>
  configureStore({
    reducer: {
      template: templateReducer,
      document: documentReducer,
    },
    preloadedState,
  });

describe('DocumentWorkAreaForm', () => {
  it('renders working area header and key sections', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <DocumentWorkAreaForm />
      </Provider>,
    );

    expect(screen.getByText(/Working Area — Manual Input/i)).toBeInTheDocument();
    expect(screen.getByText(/Property Details/i)).toBeInTheDocument();
    expect(screen.getByText(/Tenant Details/i)).toBeInTheDocument();
    expect(screen.getByText(/Financial Details/i)).toBeInTheDocument();
  });

  it('updates Redux when user edits tenant full name manually', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <DocumentWorkAreaForm />
      </Provider>,
    );

    const input = screen.getByLabelText('Full Name');
    fireEvent.change(input, { target: { value: 'Ahmed Ali' } });

    expect(store.getState().document.tenant.fullName).toBe('Ahmed Ali');
  });

  it('shows salary certificate section when active template is salaryCertificate', () => {
    const store = makeStore({ template: { activeTemplate: 'salaryCertificate' } });
    render(
      <Provider store={store}>
        <DocumentWorkAreaForm />
      </Provider>,
    );

    expect(screen.getByText(/Salary Certificate Fields/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Employee Name/i)).toBeInTheDocument();
  });
});
