import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import uiCommandReducer from '../../store/uiCommandSlice';

vi.mock('../SkipLink', () => ({
  default: () => <div data-testid="skip-link-stub">SkipLink</div>,
}));

vi.mock('../TopNavbar', () => ({
  default: () => <div data-testid="top-navbar-stub">TopNavbar</div>,
}));

vi.mock('../ToastHost', () => ({
  default: () => <div data-testid="toast-host-stub">ToastHost</div>,
}));

vi.mock('../CommandPalette', () => ({
  default: () => <div data-testid="command-palette-stub">CommandPalette</div>,
}));

vi.mock('./AppSidebar', () => ({
  default: () => <div data-testid="app-sidebar-stub">AppSidebar</div>,
}));

import UnifiedAppShell from './UnifiedAppShell';

const makeStore = (preloadedState = {}) =>
  configureStore({
    reducer: {
      uiCommand: uiCommandReducer,
    },
    preloadedState,
  });

const renderShell = (store = makeStore()) =>
  render(
    <Provider store={store}>
      <UnifiedAppShell>
        <div data-testid="shell-child">Shell child content</div>
      </UnifiedAppShell>
    </Provider>,
  );

afterEach(cleanup);

describe('UnifiedAppShell', () => {
  it('renders shell support components and child content', () => {
    renderShell();

    expect(screen.getByTestId('skip-link-stub')).toBeInTheDocument();
    expect(screen.getByTestId('top-navbar-stub')).toBeInTheDocument();
    expect(screen.getByTestId('app-sidebar-stub')).toBeInTheDocument();
    expect(screen.getByTestId('toast-host-stub')).toBeInTheDocument();
    expect(screen.getByTestId('command-palette-stub')).toBeInTheDocument();
    expect(screen.getByTestId('shell-child')).toBeInTheDocument();
  });

  it('wraps page content in the shell content workspace and inner frame', () => {
    renderShell();

    const workspace = screen.getByLabelText(/main content workspace/i);
    expect(workspace).toHaveClass('henry-shell__content');
    const inner = workspace.querySelector('.henry-shell__content-inner');
    expect(inner).not.toBeNull();
    expect(inner).toContainElement(screen.getByTestId('shell-child'));
  });

  it('marks sidebar state as expanded by default', () => {
    renderShell();

    const shell = screen.getByLabelText(/main content workspace/i).parentElement;
    expect(shell).toHaveAttribute('data-sidebar-state', 'expanded');
    expect(shell).not.toHaveClass('is-sidebar-collapsed');
  });

  it('marks sidebar state as collapsed when left rail is collapsed', () => {
    const store = makeStore({
      uiCommand: {
        leftRail: 'collapsed',
        drawerTab: null,
        chatOpen: false,
        chatActivationKey: 0,
        printTrigger: 0,
        previewMode: false,
        commandPaletteOpen: false,
      },
    });

    renderShell(store);

    const shell = screen.getByLabelText(/main content workspace/i).parentElement;
    expect(shell).toHaveAttribute('data-sidebar-state', 'collapsed');
    expect(shell).toHaveClass('is-sidebar-collapsed');
  });
});
