import React from 'react';
import SkipLink from '../SkipLink';
import TopNavbar from '../TopNavbar';
import ToastHost from '../ToastHost';
import CommandPalette from '../CommandPalette';
import AppSidebar from './AppSidebar';

const UnifiedAppShell = ({ children }) => {
  return (
    <>
      <SkipLink />
      <TopNavbar />
      <div className="henry-shell">
        <AppSidebar />
        <section className="henry-shell__content" aria-label="Main content workspace">
          {children}
        </section>
      </div>
      <ToastHost />
      <CommandPalette />
    </>
  );
};

export default UnifiedAppShell;
