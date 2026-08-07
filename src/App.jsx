import React from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentPage } from './store/appRouteSlice';
import DocumentHubPage from './components/DocumentHubPage';
import SIFPayrollPage from './components/SIFPayrollPage';
import TenancyContractBuilderPage from './components/tenancyBuilder/TenancyContractBuilderPage';
import TitleDeedModulePage from './components/titleDeed/TitleDeedModulePage';
import EmiratesIdModulePage from './components/emiratesId/EmiratesIdModulePage';
import TenantIdentityDocsPage from './components/tenantIdentity/TenantIdentityDocsPage';
import UnifiedAppShell from './components/layout/UnifiedAppShell';
import useAutosaveDebounce from './hooks/useAutosaveDebounce';

const App = () => {
  // T-39 — single root-level debounce flushes the autosave pill from
  // 'saving' → 'saved' 600ms after the last document mutation.
  useAutosaveDebounce();

  // Route based on Redux state
  const currentPage = useSelector(selectCurrentPage);
  const resolvePage = () => {
    switch (currentPage) {
      case 'payroll':
        return <SIFPayrollPage />;
      case 'tenancyBuilder':
        return <TenancyContractBuilderPage />;
      case 'titleDeed':
        return <TitleDeedModulePage />;
      case 'emiratesId':
        return <EmiratesIdModulePage />;
      case 'tenantIdentityDocs':
        return <TenantIdentityDocsPage />;
      case 'documentHub':
      default:
        return <DocumentHubPage useInternalNavigation={false} />;
    }
  };

  return <UnifiedAppShell>{resolvePage()}</UnifiedAppShell>;
};

export default App;
