import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import templateReducer from '../store/templateSlice';
import policyMetaReducer from '../store/policyMetaSlice';
import uiCommandReducer from '../store/uiCommandSlice';

vi.mock('../store/selectors', () => ({
  selectActiveTemplateLabel: () => 'Booking Form (Standard Leasing)',
  selectCanGeneratePdf: () => true,
}));

vi.mock('../hooks/useComplianceBadge', () => ({
  useComplianceBadge: () => ({
    badgeTone: 'success',
    badgeLabel: 'All clear',
    badgeTitle: 'No compliance warnings',
    handleComplianceCheck: vi.fn(),
  }),
}));

vi.mock('../hooks/useDrawer', () => ({
  useDrawer: () => ({
    drawerTab: null,
    openCompliance: vi.fn(),
    openArchive: vi.fn(),
    openAudit: vi.fn(),
    closeDrawer: vi.fn(),
  }),
}));

vi.mock('../hooks/useFocusTrap', () => ({ default: () => ({ current: null }) }));
vi.mock('../hooks/useBackgroundInert', () => ({ default: () => {} }));

vi.mock('../templates/registry', () => ({
  TEMPLATE_MAP: {
    booking: {
      key: 'booking',
      label: 'Booking Form (Standard Leasing)',
      supportsPdf: true,
      component: () => <div data-testid="active-template-stub">Template</div>,
    },
  },
}));

vi.mock('./FooterActionBar', () => ({ default: () => <div data-testid="footer-bar-stub">Footer</div> }));
vi.mock('./ChatDock', () => ({ default: () => <div data-testid="chat-dock-stub">ChatDock</div> }));
vi.mock('./PrintPreviewModal', () => ({
  default: ({ isOpen }) => <div data-testid="print-preview-stub">Preview:{String(isOpen)}</div>,
}));
vi.mock('./DocumentChecklistPanel', () => ({
  default: () => <div data-testid="checklist-panel-stub">Checklist</div>,
}));
vi.mock('./documentHub/HubDrawer', () => ({
  default: () => <div data-testid="hub-drawer-stub">Drawer</div>,
}));
vi.mock('./documentHub/HubLeftRail', () => ({
  default: () => <div data-testid="hub-left-rail-stub">LeftRail</div>,
}));
vi.mock('./documentHub/HubMobileQuickNav', () => ({
  default: () => <nav aria-label="mobile drawer navigation" data-testid="mobile-quick-nav-stub" />,
}));
vi.mock('./documentHub/HubWorkspace', () => ({
  default: ({ leftRailSlot, rightPanelSlot }) => (
    <section data-testid="hub-workspace-stub">
      <div data-testid="hub-workspace-left-slot">{leftRailSlot}</div>
      <div data-testid="hub-workspace-right-slot">{rightPanelSlot}</div>
    </section>
  ),
}));

import DocumentHubPage from './DocumentHubPage';

const makeStore = (preloadedState = {}) =>
  configureStore({
    reducer: {
      template: templateReducer,
      policyMeta: policyMetaReducer,
      uiCommand: uiCommandReducer,
    },
    preloadedState,
  });

const renderHub = (props = {}, preloadedState = {}) => {
  const store = makeStore(preloadedState);
  return render(
    <Provider store={store}>
      <DocumentHubPage {...props} />
    </Provider>,
  );
};

describe('DocumentHubPage integration shell wiring', () => {
  it('applies shell semantic classes and renders shared shell components', () => {
    renderHub();

    const main = screen.getByRole('main');
    expect(main).toHaveClass('app-layout');
    expect(main).toHaveClass('workflow-page');
    expect(main).toHaveClass('shell-page');

    expect(screen.getByTestId('hub-workspace-stub')).toBeInTheDocument();
    expect(screen.getByTestId('footer-bar-stub')).toBeInTheDocument();
    expect(screen.getByTestId('hub-drawer-stub')).toBeInTheDocument();
    expect(screen.getByTestId('chat-dock-stub')).toBeInTheDocument();
  });

  it('renders internal navigation slots by default', () => {
    renderHub();

    expect(screen.getByTestId('hub-left-rail-stub')).toBeInTheDocument();
    expect(screen.getByTestId('mobile-quick-nav-stub')).toBeInTheDocument();
    expect(screen.getByTestId('checklist-panel-stub')).toBeInTheDocument();
  });

  it('hides internal nav controls when useInternalNavigation is false', () => {
    renderHub({ useInternalNavigation: false });

    expect(screen.queryByTestId('hub-left-rail-stub')).toBeNull();
    expect(screen.queryByTestId('mobile-quick-nav-stub')).toBeNull();
    expect(screen.getByTestId('checklist-panel-stub')).toBeInTheDocument();
  });
});
