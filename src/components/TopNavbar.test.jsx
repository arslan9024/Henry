import React from 'react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import templateReducer from '../store/templateSlice';
import policyMetaReducer from '../store/policyMetaSlice';
import henryReducer from '../store/henrySlice';
import uiCommandReducer from '../store/uiCommandSlice';

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
