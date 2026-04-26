import React from 'react';
import DocumentHubPage from './components/DocumentHubPage';
import TopNavbar from './components/TopNavbar';
import ToastHost from './components/ToastHost';
import SkipLink from './components/SkipLink';
import CommandPalette from './components/CommandPalette';
import useAutosaveDebounce from './hooks/useAutosaveDebounce';

const App = () => {
  // T-39 — single root-level debounce flushes the autosave pill from
  // 'saving' → 'saved' 600ms after the last document mutation.
  useAutosaveDebounce();
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
