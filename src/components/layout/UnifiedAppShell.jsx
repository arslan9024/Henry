/**
 * [Category 1: View]
 * UnifiedAppShell - Master Layout Shell (< 50 lines, zero overlap).
 */

import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import SkipLink from '../SkipLink';
import TopNavbar from '../TopNavbar';
import ToastHost from '../ToastHost';
import CommandPalette from '../CommandPalette';
import AppSidebar from './AppSidebar';
import RightSidePanel from './RightSidePanel';
import DocumentVaultModal from '../vault/DocumentVaultModal';
import UniversalDocumentViewModal from '../vault/UniversalDocumentViewModal';
import { selectLeftRail } from '../../store/uiCommandSlice';
import { selectCurrentPage, APP_PAGES } from '../../store/appRouteSlice';
import '../../styles/layout/index.css';

export const UnifiedAppShell = ({ children }) => {
  const leftRail = useSelector(selectLeftRail);
  const currentPage = useSelector(selectCurrentPage);
  const isStudio = currentPage === APP_PAGES.TENANCY_STUDIO;

  const shellClassName =
    `henry-shell ${leftRail === 'collapsed' ? 'is-sidebar-collapsed' : ''} ${isStudio ? 'is-studio-mode' : ''}`.trim();
  const sidebarState = leftRail === 'collapsed' ? 'collapsed' : 'expanded';

  return (
    <div className="master-app-root">
      <SkipLink />
      <TopNavbar />
      <div className={`master-workspace-body ${shellClassName}`} data-sidebar-state={sidebarState}>
        <AppSidebar />
        <section className="master-main-screen henry-shell__content" aria-label="Main content workspace">
          <div className="master-main-screen__inner henry-shell__content-inner">{children}</div>
        </section>
        <RightSidePanel />
      </div>
      <ToastHost />
      <CommandPalette />
      <DocumentVaultModal />
      <UniversalDocumentViewModal />
    </div>
  );
};

UnifiedAppShell.propTypes = {
  children: PropTypes.node,
};

export default UnifiedAppShell;
