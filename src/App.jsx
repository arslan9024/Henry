import React from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentPage } from './store/appRouteSlice';
import DocumentHubPage from './components/DocumentHubPage';
import SIFPayrollPage from './components/SIFPayrollPage';
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

  // If on payroll page, render that instead (it has its own navbar/layout)
  if (isPayrollPage) {
    return <SIFPayrollPage />;
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
