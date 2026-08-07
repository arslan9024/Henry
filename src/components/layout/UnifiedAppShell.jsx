import React from 'react';
import { useSelector } from 'react-redux';
import SkipLink from '../SkipLink';
import TopNavbar from '../TopNavbar';
import ToastHost from '../ToastHost';
import CommandPalette from '../CommandPalette';
import AppSidebar from './AppSidebar';
import { selectLeftRail } from '../../store/uiCommandSlice';

const UnifiedAppShell = ({ children }) => {
  const leftRail = useSelector(selectLeftRail);
  const shellClassName = `henry-shell ${leftRail === 'collapsed' ? 'is-sidebar-collapsed' : ''}`;
  const sidebarState = leftRail === 'collapsed' ? 'collapsed' : 'expanded';

  return (
    <>
      <SkipLink />
      <TopNavbar />
      <div className={shellClassName} data-sidebar-state={sidebarState}>
        <AppSidebar />
        <section className="henry-shell__content" aria-label="Main content workspace">
          <div className="henry-shell__content-inner">{children}</div>
        </section>
      </div>
      <ToastHost />
      <CommandPalette />
    </>
  );
};

export default UnifiedAppShell;
