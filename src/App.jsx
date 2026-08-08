import React from 'react';
import { useSelector } from 'react-redux';
import { APP_PAGES, selectCurrentPage } from './store/appRouteSlice';
import DocumentWorkspacePage from './components/DocumentWorkspacePage';
import DocumentHubPage from './components/DocumentHubPage';
import SIFPayrollPage from './components/SIFPayrollPage';
import TenancyContractBuilderPage from './components/tenancyBuilder/TenancyContractBuilderPage';
import TitleDeedModulePage from './components/titleDeed/TitleDeedModulePage';
import EmiratesIdModulePage from './components/emiratesId/EmiratesIdModulePage';
import TenantIdentityDocsPage from './components/tenantIdentity/TenantIdentityDocsPage';
import ValidationDashboardPage from './components/ValidationDashboardPage';
import UnifiedAppShell from './components/layout/UnifiedAppShell';
import useAutosaveDebounce from './hooks/useAutosaveDebounce';

const App = () => {
  // T-39 — single root-level debounce flushes the autosave pill from
  // 'saving' → 'saved' 600ms after the last document mutation.
  useAutosaveDebounce();

  // Route based on Redux state
  const currentPage = useSelector(selectCurrentPage);
  const pageByRoute = {
    [APP_PAGES.DOCUMENT_WORKSPACE]: <DocumentWorkspacePage />,
    [APP_PAGES.DOCUMENT_HUB]: <DocumentHubPage useInternalNavigation={false} />,
    [APP_PAGES.PAYROLL]: <SIFPayrollPage />,
    [APP_PAGES.TENANCY_BUILDER]: <TenancyContractBuilderPage />,
    [APP_PAGES.TITLE_DEED]: <TitleDeedModulePage />,
    [APP_PAGES.EMIRATES_ID]: <EmiratesIdModulePage />,
    [APP_PAGES.TENANT_IDENTITY_DOCS]: <TenantIdentityDocsPage />,
    [APP_PAGES.VALIDATION_DASHBOARD]: <ValidationDashboardPage />,
  };

  const resolvePage = () => {
    return pageByRoute[currentPage] ?? pageByRoute[APP_PAGES.DOCUMENT_WORKSPACE];
  };

  return <UnifiedAppShell>{resolvePage()}</UnifiedAppShell>;
};

export default App;
