import React from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentPage } from './store/appRouteSlice';
import DocumentHubPage from './components/DocumentHubPage';
import SIFPayrollPage from './components/SIFPayrollPage';
import TenancyContractBuilderPage from './components/tenancyBuilder/TenancyContractBuilderPage';
import TitleDeedModulePage from './components/titleDeed/TitleDeedModulePage';
import EmiratesIdModulePage from './components/emiratesId/EmiratesIdModulePage';
import TenantIdentityDocsPage from './components/tenantIdentity/TenantIdentityDocsPage';
import TopNavbar from './components/TopNavbar';
import ToastHost from './components/ToastHost';
import SkipLink from './components/SkipLink';
import CommandPalette from './components/CommandPalette';
import useAutosaveDebounce from './hooks/useAutosaveDebounce';

const App = () => {
  // T-39 — single root-level debounce flushes the autosave pill from
  // 'saving' → 'saved' 600ms after the last document mutation.
  useAutosaveDebounce();

  // Route based on Redux state
  const currentPage = useSelector(selectCurrentPage);
  const isPayrollPage = currentPage === 'payroll';
  const isTenancyBuilderPage = currentPage === 'tenancyBuilder';
  const isTitleDeedPage = currentPage === 'titleDeed';
  const isEmiratesIdPage = currentPage === 'emiratesId';
  const isTenantIdentityDocsPage = currentPage === 'tenantIdentityDocs';

  // If on payroll page, render that instead (it has its own navbar/layout)
  if (isPayrollPage) {
    return <SIFPayrollPage />;
  }

  if (isTenancyBuilderPage) {
    return (
      <>
        <SkipLink />
        <TopNavbar />
        <TenancyContractBuilderPage />
        <ToastHost />
        <CommandPalette />
      </>
    );
  }

  if (isTitleDeedPage) {
    return (
      <>
        <SkipLink />
        <TopNavbar />
        <TitleDeedModulePage />
        <ToastHost />
        <CommandPalette />
      </>
    );
  }

  if (isEmiratesIdPage) {
    return (
      <>
        <SkipLink />
        <TopNavbar />
        <EmiratesIdModulePage />
        <ToastHost />
        <CommandPalette />
      </>
    );
  }

  if (isTenantIdentityDocsPage) {
    return (
      <>
        <SkipLink />
        <TopNavbar />
        <TenantIdentityDocsPage />
        <ToastHost />
        <CommandPalette />
      </>
    );
  }

  // Default: Document Hub
  return (
    <>
      {/* T-40 — first focusable element so keyboard users can bypass the navbar */}
      <SkipLink />
      <TopNavbar />
      <DocumentHubPage />
      <ToastHost />
      {/* T-41 — Ctrl+K command palette, rendered at root so it portals above everything */}
      <CommandPalette />
    </>
  );
};

export default App;
