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
    expect(screen.getByLabelText(/Select document for preview \/ print/i)).toBeInTheDocument();
    expect(screen.getByText(/1\) Select template/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Open Ask Henry chat/i })).toBeInTheDocument();
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

  it('shows Key Handover Details section when activeTemplate is keyHandover', () => {
    const store = makeStore({ template: { activeTemplate: 'keyHandover' } });
    render(
      <Provider store={store}>
        <DocumentWorkAreaForm />
      </Provider>,
    );

    // Section header rendered
    expect(screen.getByRole('button', { name: /Key Handover Details/i })).toBeInTheDocument();
    // defaultOpen=true so fields are immediately visible
    expect(screen.getByLabelText(/Reference Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Handover Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Property Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Security Deposit/i)).toBeInTheDocument();
  });

  it('updates keyHandover.tenantName in Redux when the Tenant Name input changes', () => {
    const store = makeStore({ template: { activeTemplate: 'keyHandover' } });
    render(
      <Provider store={store}>
        <DocumentWorkAreaForm />
      </Provider>,
    );

    const input = screen.getByLabelText('Tenant Name');
    fireEvent.change(input, { target: { value: 'Fatima Al Rashid' } });

    expect(store.getState().document.keyHandover.tenantName).toBe('Fatima Al Rashid');
  });

  it('updates keyHandover.referenceNumber in Redux when the Reference Number input changes', () => {
    const store = makeStore({ template: { activeTemplate: 'keyHandover' } });
    render(
      <Provider store={store}>
        <DocumentWorkAreaForm />
      </Provider>,
    );

    const input = screen.getByLabelText('Reference Number');
    fireEvent.change(input, { target: { value: 'KH-2026-042' } });

    expect(store.getState().document.keyHandover.referenceNumber).toBe('KH-2026-042');
  });

  it('shows Property Condition section when activeTemplate is keyHandover and user opens it', () => {
    const store = makeStore({ template: { activeTemplate: 'keyHandover' } });
    render(
      <Provider store={store}>
        <DocumentWorkAreaForm />
      </Provider>,
    );

    // Property Condition is not defaultOpen — click to expand
    fireEvent.click(screen.getByRole('button', { name: /Property Condition/i }));

    expect(screen.getByLabelText(/Walls Condition/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/AC Condition/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cleaning Status/i)).toBeInTheDocument();
  });

  it('updates keyHandover.wallsCondition in Redux from Property Condition section', () => {
    const store = makeStore({ template: { activeTemplate: 'keyHandover' } });
    render(
      <Provider store={store}>
        <DocumentWorkAreaForm />
      </Provider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /Property Condition/i }));

    const input = screen.getByLabelText('Walls Condition');
    fireEvent.change(input, { target: { value: 'Needs Repainting' } });

    expect(store.getState().document.keyHandover.wallsCondition).toBe('Needs Repainting');
  });

  it('does NOT show keyHandover sections when activeTemplate is a different template', () => {
    const store = makeStore({ template: { activeTemplate: 'viewing' } });
    render(
      <Provider store={store}>
        <DocumentWorkAreaForm />
      </Provider>,
    );

    expect(screen.queryByRole('button', { name: /Key Handover Details/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Property Condition/i })).not.toBeInTheDocument();
  });
});
