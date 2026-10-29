/**
 * [Category 1: View]
 * White Caves Real Estate - Top Navbar Quick Module Navigation
 * Search palette, Document Vault, Payroll switcher, and quick route tabs (< 85 lines).
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { openCommandPalette } from '../../store/uiCommandSlice';
import { toggleVaultModal } from '../../store/documentVaultSlice';
import { APP_PAGE_NAV_ITEMS, APP_PAGES, selectCurrentPage } from '../../store/appRouteSlice';
import useAppNavigation from '../../hooks/useAppNavigation';

export const TopNavbarQuickNav = () => {
  const dispatch = useDispatch();
  const currentPage = useSelector(selectCurrentPage);
  const { goToPage } = useAppNavigation();

  const togglePayroll = () => {
    if (currentPage === APP_PAGES.PAYROLL) {
      goToPage(APP_PAGES.DOCUMENT_HUB);
    } else {
      goToPage(APP_PAGES.PAYROLL);
    }
  };

  const topNavQuickRoutes = APP_PAGE_NAV_ITEMS.filter(
    (item) =>
      item.key !== APP_PAGES.DOCUMENT_WORKSPACE &&
      item.key !== APP_PAGES.DOCUMENT_HUB &&
      item.key !== APP_PAGES.PAYROLL,
  );

  return (
    <div className="top-navbar__quick-nav" role="group" aria-label="Quick module navigation">
      <button
        type="button"
        className="density-toggle payroll-nav-btn top-navbar__nav-btn"
        onClick={() => dispatch(openCommandPalette())}
        aria-label="Open command palette (Ctrl+K)"
        title="Command palette (Ctrl+K)"
        data-active="false"
      >
        ⌘ Search
      </button>

      <button
        type="button"
        className="density-toggle payroll-nav-btn top-navbar__nav-btn"
        onClick={() => dispatch(toggleVaultModal())}
        aria-label="Open Document Vault"
        title="Open Persistent In-Browser Document Vault"
        data-active="false"
      >
        🗄️ Vault
      </button>

      <button
        type="button"
        className="density-toggle payroll-nav-btn top-navbar__nav-btn"
        onClick={togglePayroll}
        aria-label={
          currentPage === APP_PAGES.PAYROLL
            ? 'Navigate back to Documents'
            : 'Navigate to WPS SIF Payroll Generator'
        }
        title={currentPage === APP_PAGES.PAYROLL ? 'Back to Documents' : 'WPS SIF Payroll Generator'}
        data-active={currentPage === APP_PAGES.PAYROLL ? 'true' : 'false'}
      >
        {currentPage === APP_PAGES.PAYROLL ? '📄 Documents' : '💳 Payroll'}
      </button>

      {topNavQuickRoutes.map((item) => (
        <button
          key={item.key}
          type="button"
          className="density-toggle payroll-nav-btn top-navbar__nav-btn"
          onClick={() => goToPage(item.key)}
          aria-label={`Navigate to ${item.label}`}
          title={item.label}
          data-active={currentPage === item.key ? 'true' : 'false'}
        >
          {item.icon} {item.label}
        </button>
      ))}
    </div>
  );
};

export default React.memo(TopNavbarQuickNav);
