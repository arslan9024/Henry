import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import documentReducer from '../../store/documentSlice';
import templateReducer from '../../store/templateSlice';
import { APP_PAGES } from '../../store/appRouteSlice';

const mocks = vi.hoisted(() => ({
  createGateState: () => ({
    landlordGateStatus: {
      ready: false,
      missing: ['Landlord mobile', 'Title deed upload'],
      titleDeedCount: 0,
      landlordEmiratesIdCount: 0,
    },
    tenantGateStatus: {
      ready: false,
      missing: ['Tenant mobile', 'Passport upload'],
      tenantEmiratesIdCount: 0,
      passportCount: 0,
      residencePermitCount: 0,
    },
    completionMap: {
      landlord: { completed: false, missing: ['landlord.phone'] },
      property: { completed: false, missing: ['property.unit'] },
      tenant: { completed: false, missing: ['tenant.contactNo'] },
      contract: { completed: false, missing: ['payments.contractStartDate'] },
      terms: { completed: true, missing: [] },
      addendum: { completed: false, missing: ['addendum.effectiveDate'] },
    },
    getStepBlockCopy: () => ({
      title: 'Step blocked',
      body: 'Missing required fields.',
    }),
  }),
  goToPage: vi.fn(),
  gateState: null,
}));

mocks.gateState = mocks.createGateState();

vi.mock('../../hooks/useAppNavigation', () => ({
  default: () => ({
    goToPage: mocks.goToPage,
  }),
}));

vi.mock('../../hooks/useGateStatus', () => ({
  default: () => mocks.gateState,
}));

vi.mock('../../records/templateStore', () => ({
  loadTenancyTemplates: () => [],
  getTenancyTemplateFolders: () => ({
    master: 'records/templates/master',
    workingCopies: 'records/templates/working-copies',
  }),
  saveTenancyTemplate: vi.fn(),
  createEditableTemplateCopy: vi.fn(),
}));

vi.mock('../../records/titleDeedStore', () => ({
  loadTitleDeedReferences: () => [],
}));

vi.mock('../../records/emiratesIdStore', () => ({
  loadEmiratesIdReferences: () => [],
}));

vi.mock('../../records/tenantDocumentStore', () => ({
  loadTenantDocumentReferences: () => [],
  saveTenantDocumentReference: vi.fn(),
}));

vi.mock('../../services/fileExtractionService', () => ({
  extractTextFromFile: vi.fn(),
}));

vi.mock('../../services/whatsappQueueService', () => ({
  queueWhatsAppSharePackage: vi.fn(),
}));

vi.mock('../../records/archiveService', () => ({
  persistRecordFile: vi.fn(),
}));

vi.mock('../../pdf/templateFieldRegistry', () => ({
  getTenancyFieldProfile: () => ({ label: 'Tenancy Registry Profile' }),
  getRequiredMappedFields: () => [
    { path: 'tenant.fullName', label: 'Tenant Name' },
    { path: 'property.unit', label: 'Property Unit' },
  ],
}));

vi.mock('./PlacementActionPanel', () => ({
  default: (props) => (
    <div
      data-testid="placement-action-panel-stub"
      data-can-finalize={String(props.canFinalize)}
      data-landlord-ready={String(props.landlordReady)}
      data-tenant-ready={String(props.tenantReady)}
      data-contract-ready={String(props.contractReady)}
      data-blocker-count={String((props.finalizationBlockers || []).length)}
    >
      <span>{props.sharePhoneValidationText}</span>
    </div>
  ),
}));

import TenancyContractBuilderPage from './TenancyContractBuilderPage';

const makeStore = () =>
  configureStore({
    reducer: {
      document: documentReducer,
      template: templateReducer,
    },
  });

const renderPage = () =>
  render(
    <Provider store={makeStore()}>
      <TenancyContractBuilderPage />
    </Provider>,
  );

describe('TenancyContractBuilderPage integration shell', () => {
  beforeEach(() => {
    mocks.goToPage.mockReset();
    mocks.gateState = mocks.createGateState();
  });

  it('renders shell/workflow semantic classes and key heading', () => {
    renderPage();

    const main = screen.getByRole('main');
    expect(main).toHaveClass('tenancy-builder-page');
    expect(main).toHaveClass('workflow-page');
    expect(main).toHaveClass('shell-page');

    const header = screen.getByText(/tenancy contract builder/i).closest('section');
    expect(header).toHaveClass('workflow-page__header');
    expect(header).toHaveClass('tenancy-builder-header');

    const headerCopy = screen.getByText(/upload tenancy template, complete guided steps/i).closest('div');
    expect(headerCopy).toHaveClass('workflow-page__header-copy');

    const headerActions = screen.getByRole('button', { name: /back to document hub/i }).closest('div');
    expect(headerActions).toHaveClass('workflow-page__header-actions');

    const grid = screen.getByText(/workflow steps/i).closest('section');
    expect(grid).toHaveClass('workflow-page__grid');
    expect(grid).toHaveClass('workflow-page__grid--three-rail');

    const stepRail = screen.getByText(/workflow steps/i).closest('aside');
    expect(stepRail).toHaveClass('workflow-page__rail');

    const exportRail = screen.getByText(/template \+ export/i).closest('aside');
    expect(exportRail).toHaveClass('workflow-page__rail');

    const formMain = screen.getByRole('heading', { name: /landlord/i }).closest('.workflow-page__main');
    expect(formMain).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: /tenancy contract builder/i })).toBeInTheDocument();
  });

  it('routes back to document hub from the header action', () => {
    renderPage();

    screen.getByRole('button', { name: /back to document hub/i }).click();
    expect(mocks.goToPage).toHaveBeenCalledWith(APP_PAGES.DOCUMENT_HUB);
  });

  it('routes landlord and tenant upload CTAs to their target modules', async () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /upload title deed/i }));
    fireEvent.click(screen.getByRole('button', { name: /upload landlord emirates id/i }));

    const stepsRail = screen.getByText(/workflow steps/i).closest('aside');
    const tenantStepButton = within(stepsRail).getByRole('button', { name: /3\.\s*tenant/i });
    fireEvent.click(tenantStepButton);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /tenant/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /upload tenant emirates id/i }));
    fireEvent.click(screen.getByRole('button', { name: /open tenant identity scanner/i }));

    expect(mocks.goToPage).toHaveBeenNthCalledWith(1, APP_PAGES.TITLE_DEED);
    expect(mocks.goToPage).toHaveBeenNthCalledWith(2, APP_PAGES.EMIRATES_ID);
    expect(mocks.goToPage).toHaveBeenNthCalledWith(3, APP_PAGES.EMIRATES_ID);
    expect(mocks.goToPage).toHaveBeenNthCalledWith(4, APP_PAGES.TENANT_IDENTITY_DOCS);
  });

  it('keeps user on current step when Continue is blocked by missing required fields', () => {
    renderPage();

    expect(screen.getByRole('heading', { name: /^landlord$/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    expect(screen.getByRole('heading', { name: /^landlord$/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /^property$/i })).not.toBeInTheDocument();
  });

  it('advances to next step when current step requirements are complete', async () => {
    mocks.gateState = {
      ...mocks.gateState,
      completionMap: {
        ...mocks.gateState.completionMap,
        landlord: { completed: true, missing: [] },
      },
    };

    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /^property$/i })).toBeInTheDocument();
    });
  });

  it('returns to previous step when Previous is clicked after step advance', async () => {
    mocks.gateState = {
      ...mocks.gateState,
      completionMap: {
        ...mocks.gateState.completionMap,
        landlord: { completed: true, missing: [] },
      },
    };

    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /^property$/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /previous/i }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /^landlord$/i })).toBeInTheDocument();
    });
  });

  it('toggles Previous button from disabled to enabled once user advances a step', async () => {
    mocks.gateState = {
      ...mocks.gateState,
      completionMap: {
        ...mocks.gateState.completionMap,
        landlord: { completed: true, missing: [] },
      },
    };

    renderPage();

    const previousButton = screen.getByRole('button', { name: /previous/i });
    expect(previousButton).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /^property$/i })).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /previous/i })).toBeEnabled();
  });

  it('disables Continue on final step and re-enables it after returning to an earlier step', async () => {
    renderPage();

    const stepsRail = screen.getByText(/workflow steps/i).closest('aside');
    fireEvent.click(within(stepsRail).getByRole('button', { name: /6\.\s*addendum/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /^addendum$/i })).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: /previous/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /additional terms/i })).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /continue/i })).toBeEnabled();
  });

  it('passes blocked finalization state to PlacementActionPanel when gates are incomplete', async () => {
    mocks.gateState = {
      ...mocks.gateState,
      landlordGateStatus: {
        ...mocks.gateState.landlordGateStatus,
        ready: false,
      },
      tenantGateStatus: {
        ...mocks.gateState.tenantGateStatus,
        ready: false,
      },
      completionMap: {
        ...mocks.gateState.completionMap,
        tenant: { completed: false, missing: ['tenant.contactNo'] },
        contract: { completed: false, missing: ['payments.contractStartDate'] },
      },
    };

    renderPage();

    const panel = await screen.findByTestId('placement-action-panel-stub');
    expect(panel).toHaveAttribute('data-can-finalize', 'false');
    expect(panel).toHaveAttribute('data-landlord-ready', 'false');
    expect(panel).toHaveAttribute('data-tenant-ready', 'false');
    expect(Number(panel.getAttribute('data-blocker-count'))).toBeGreaterThan(0);
  });

  it('passes ready finalization state when all gates and contract readiness are complete', async () => {
    mocks.gateState = {
      ...mocks.gateState,
      landlordGateStatus: {
        ...mocks.gateState.landlordGateStatus,
        ready: true,
        missing: [],
        titleDeedCount: 1,
        landlordEmiratesIdCount: 1,
      },
      tenantGateStatus: {
        ...mocks.gateState.tenantGateStatus,
        ready: true,
        missing: [],
        tenantEmiratesIdCount: 1,
        passportCount: 1,
        residencePermitCount: 1,
      },
      completionMap: {
        landlord: { completed: true, missing: [] },
        property: { completed: true, missing: [] },
        tenant: { completed: true, missing: [] },
        contract: { completed: true, missing: [] },
        terms: { completed: true, missing: [] },
        addendum: { completed: true, missing: [] },
      },
    };

    renderPage();

    const panel = await screen.findByTestId('placement-action-panel-stub');
    await waitFor(() => {
      expect(panel).toHaveAttribute('data-can-finalize', 'true');
      expect(panel).toHaveAttribute('data-landlord-ready', 'true');
      expect(panel).toHaveAttribute('data-tenant-ready', 'true');
      expect(panel).toHaveAttribute('data-contract-ready', 'true');
      expect(panel).toHaveAttribute('data-blocker-count', '0');
    });
  });
});
