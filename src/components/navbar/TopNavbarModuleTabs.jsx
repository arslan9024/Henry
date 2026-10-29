/**
 * [Category 1: View]
 * White Caves Real Estate - Top Navbar Module Navigation Tabs
 * Prominent, luxury direct navigation tabs across core Henry modules (< 85 lines).
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleVaultModal } from '../../store/documentVaultSlice';
import { APP_PAGES, selectCurrentPage } from '../../store/appRouteSlice';
import useAppNavigation from '../../hooks/useAppNavigation';

const PRIMARY_MODULES = [
  { key: APP_PAGES.TENANCY_STUDIO, label: 'Tenancy Studio', icon: '✨' },
  { key: APP_PAGES.DOCUMENT_HUB, label: 'Document Hub', icon: '📄' },
  { key: APP_PAGES.EMIRATES_ID, label: 'Emirates ID & KYC', icon: '🪪' },
  { key: APP_PAGES.TITLE_DEED, label: 'Title Deed', icon: '🏷️' },
  { key: APP_PAGES.PAYROLL, label: 'Payroll', icon: '💳' },
  { key: APP_PAGES.WORKFLOW_BLUEPRINTS, label: 'Workflows', icon: '🗺️' },
];

export const TopNavbarModuleTabs = () => {
  const dispatch = useDispatch();
  const currentPage = useSelector(selectCurrentPage);
  const { goToPage } = useAppNavigation();

  return (
    <nav className="top-navbar__module-tabs" role="navigation" aria-label="Core Module Navigation">
      {PRIMARY_MODULES.map((mod) => {
        const isActive = currentPage === mod.key;
        return (
          <button
            key={mod.key}
            type="button"
            className={`top-navbar__tab-btn ${isActive ? 'is-active' : ''}`}
            onClick={() => goToPage(mod.key)}
            aria-current={isActive ? 'page' : undefined}
            title={`Switch to ${mod.label}`}
          >
            <span className="top-navbar__tab-icon">{mod.icon}</span>
            <span className="top-navbar__tab-label">{mod.label}</span>
          </button>
        );
      })}

      <button
        type="button"
        className="top-navbar__tab-btn top-navbar__tab-vault"
        onClick={() => dispatch(toggleVaultModal())}
        title="Open In-Browser Document Vault"
      >
        <span className="top-navbar__tab-icon">🗄️</span>
        <span className="top-navbar__tab-label">Vault</span>
      </button>
    </nav>
  );
};

export default React.memo(TopNavbarModuleTabs);
