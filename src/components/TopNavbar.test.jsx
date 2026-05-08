import React from 'react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent, within, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import templateReducer from '../store/templateSlice';
import { setActiveTemplate } from '../store/templateSlice';
import policyMetaReducer from '../store/policyMetaSlice';
import henryReducer from '../store/henrySlice';
import uiCommandReducer from '../store/uiCommandSlice';
import documentReducer from '../store/documentSlice';
import complianceReducer from '../store/complianceSlice';

vi.mock('../hooks/useDensity', () => ({
  default: () => ({ density: 'comfortable', toggle: vi.fn() }),
}));

vi.mock('../hooks/useTheme', () => ({
  default: () => ({ mode: 'system', resolved: 'light', cycle: vi.fn() }),
}));

vi.mock('./AutosaveIndicator', () => ({
  default: () => <div>Autosave Stub</div>,
}));

import TopNavbar from './TopNavbar';

const makeStore = (preloadedState = {}) =>
  configureStore({
    reducer: {
      template: templateReducer,
      policyMeta: policyMetaReducer,
      henry: henryReducer,
      uiCommand: uiCommandReducer,
      document: documentReducer,
      compliance: complianceReducer,
    },
    preloadedState,
  });

const renderNavbar = (store = makeStore()) =>
  render(
    <Provider store={store}>
      <TopNavbar />
    </Provider>,
  );

afterEach(cleanup);

describe('TopNavbar Henry identity popover (T-43)', () => {
  it('renders baseline navbar content', () => {
    renderNavbar();
    expect(screen.getByRole('banner', { name: /main navigation/i })).toBeInTheDocument();
    expect(screen.getByText(/Henry — Document Operations/i)).toBeInTheDocument();
    expect(screen.getByText(/Autosave Stub/i)).toBeInTheDocument();
  });

  it('opens identity popover with AI details', () => {
    renderNavbar();

    fireEvent.click(screen.getByRole('button', { name: /toggle henry identity details/i }));

    const pop = screen.getByRole('dialog', { name: /henry identity details/i });
    expect(within(pop).getByText(/AI ID:/i)).toBeInTheDocument();
    expect(within(pop).getByText(/WC-AI-003/i)).toBeInTheDocument();
    expect(within(pop).getByText(/Standalone mode/i)).toBeInTheDocument();
  });

  it('closes identity popover on Escape', () => {
    renderNavbar();

    fireEvent.click(screen.getByRole('button', { name: /toggle henry identity details/i }));
    expect(screen.getByRole('dialog', { name: /henry identity details/i })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(screen.queryByRole('dialog', { name: /henry identity details/i })).toBeNull();
  });

  it('closes identity popover on outside click', () => {
    renderNavbar();

    fireEvent.click(screen.getByRole('button', { name: /toggle henry identity details/i }));
    expect(screen.getByRole('dialog', { name: /henry identity details/i })).toBeInTheDocument();

    fireEvent.mouseDown(document.body);

    expect(screen.queryByRole('dialog', { name: /henry identity details/i })).toBeNull();
  });

  it('open palette action closes popover', () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
    renderNavbar();

    fireEvent.click(screen.getByRole('button', { name: /toggle henry identity details/i }));
    const pop = screen.getByRole('dialog', { name: /henry identity details/i });

    fireEvent.click(within(pop).getByRole('button', { name: /open palette/i }));

    expect(dispatchSpy).toHaveBeenCalled();
    expect(screen.queryByRole('dialog', { name: /henry identity details/i })).toBeNull();
    dispatchSpy.mockRestore();
  });
});

describe('TopNavbar document action buttons', () => {
  it('renders Preview, Compliance, Archive, Audit action buttons', () => {
    renderNavbar();
    expect(screen.getByRole('button', { name: /toggle print preview/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /open compliance checklist/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /open archive history/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /open audit log/i })).toBeInTheDocument();
  });

  it('preview button is disabled when template has no PDF support', () => {
    const store = makeStore({ template: { activeTemplate: 'offer' } });
    renderNavbar(store);
    expect(screen.getByRole('button', { name: /toggle print preview/i })).toBeDisabled();
  });

  it('preview button is enabled for PDF-supporting templates', () => {
    const store = makeStore({ template: { activeTemplate: 'viewing' } });
    renderNavbar(store);
    expect(screen.getByRole('button', { name: /toggle print preview/i })).toBeEnabled();
  });

  it('exits preview mode and disables preview when template has no PDF support', async () => {
    const store = makeStore({
      template: { activeTemplate: 'offer' },
      uiCommand: {
        leftRail: 'expanded',
        drawerTab: null,
        chatOpen: false,
        printTrigger: 0,
        previewMode: true,
      },
    });
    renderNavbar(store);

    await waitFor(() => {
      expect(store.getState().uiCommand.previewMode).toBe(false);
    });
    expect(screen.getByRole('button', { name: /toggle print preview/i })).toBeDisabled();
  });

  it('clicking Preview dispatches togglePreview to Redux', () => {
    const store = makeStore({ template: { activeTemplate: 'viewing' } });
    renderNavbar(store);

    expect(store.getState().uiCommand.previewMode).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: /toggle print preview/i }));
    expect(store.getState().uiCommand.previewMode).toBe(true);
  });

  it('clicking Compliance dispatches openDrawer("compliance")', () => {
    const store = makeStore();
    renderNavbar(store);
    fireEvent.click(screen.getByRole('button', { name: /open compliance checklist/i }));
    expect(store.getState().uiCommand.drawerTab).toBe('compliance');
  });

  it('clicking Archive dispatches openDrawer("archive")', () => {
    const store = makeStore();
    renderNavbar(store);
    fireEvent.click(screen.getByRole('button', { name: /open archive history/i }));
    expect(store.getState().uiCommand.drawerTab).toBe('archive');
  });

  it('clicking Audit dispatches openDrawer("audit")', () => {
    const store = makeStore();
    renderNavbar(store);
    fireEvent.click(screen.getByRole('button', { name: /open audit log/i }));
    expect(store.getState().uiCommand.drawerTab).toBe('audit');
  });

  it('shows Edit label when preview is active, Preview label otherwise', () => {
    const store = makeStore({ template: { activeTemplate: 'viewing' } });
    renderNavbar(store);

    expect(screen.getByRole('button', { name: /toggle print preview/i })).toHaveTextContent('👁 Preview');
    fireEvent.click(screen.getByRole('button', { name: /toggle print preview/i }));
    expect(screen.getByRole('button', { name: /close print preview/i })).toHaveTextContent('✏ Edit');
  });

  it('exits preview when switching from PDF template to non-PDF template', async () => {
    const store = makeStore({
      template: { activeTemplate: 'viewing' },
      uiCommand: {
        leftRail: 'expanded',
        drawerTab: null,
        chatOpen: false,
        printTrigger: 0,
        previewMode: true,
      },
    });
    renderNavbar(store);
    expect(screen.getByRole('button', { name: /close print preview/i })).toBeInTheDocument();

    store.dispatch(setActiveTemplate('offer'));

    await waitFor(() => {
      expect(store.getState().uiCommand.previewMode).toBe(false);
    });
    expect(screen.getByRole('button', { name: /toggle print preview/i })).toBeDisabled();
  });
});
