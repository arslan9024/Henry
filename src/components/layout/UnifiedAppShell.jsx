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

  return (
    <>
      <SkipLink />
      <TopNavbar />
      <div className={shellClassName}>
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
