import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectActiveTemplateLabel, selectPolicyMeta, selectHenry } from '../store/selectors';
import {
  selectCurrentPage,
  goToPayroll,
  goToDocumentHub,
  goToTenancyBuilder,
  goToTitleDeed,
  goToEmiratesId,
  goToTenantIdentityDocs,
} from '../store/appRouteSlice';
import { openCommandPalette as openCommandPaletteCommand, toggleLeftRail } from '../store/uiCommandSlice';
import useDensity from '../hooks/useDensity';
import useTheme from '../hooks/useTheme';
import AutosaveIndicator from './AutosaveIndicator';

const THEME_LABEL = {
  light: '☀ Light',
  dark: '☾ Dark',
  system: '⌥ System',
};
const THEME_NEXT = {
  light: 'dark',
  dark: 'system',
  system: 'light',
};

const TopNavbar = React.memo(() => {
  const dispatch = useDispatch();
  const policyMeta = useSelector(selectPolicyMeta);
  const activeTemplateLabel = useSelector(selectActiveTemplateLabel);
  const henry = useSelector(selectHenry);
  const currentPage = useSelector(selectCurrentPage);
  const { density, toggle: toggleDensity } = useDensity();
  const { mode: themeMode, resolved: themeResolved, cycle: cycleTheme } = useTheme();
  const [identityOpen, setIdentityOpen] = useState(false);
  const identityRef = useRef(null);

  const openCommandPalette = useCallback(() => {
    dispatch(openCommandPaletteCommand());
  }, [dispatch]);

  const togglePage = useCallback(() => {
    if (currentPage === 'payroll') {
      dispatch(goToDocumentHub());
    } else {
      dispatch(goToPayroll());
    }
  }, [currentPage, dispatch]);

  const goToBuilderPage = useCallback(() => {
    dispatch(goToTenancyBuilder());
  }, [dispatch]);

  const goToTitleDeedPage = useCallback(() => {
    dispatch(goToTitleDeed());
  }, [dispatch]);

  const goToEmiratesIdPage = useCallback(() => {
    dispatch(goToEmiratesId());
  }, [dispatch]);

  const goToTenantIdentityDocsPage = useCallback(() => {
    dispatch(goToTenantIdentityDocs());
  }, [dispatch]);

  useEffect(() => {
    if (!identityOpen) return undefined;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setIdentityOpen(false);
    };
    const onPointerDown = (e) => {
      if (!identityRef.current?.contains(e.target)) {
        setIdentityOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, [identityOpen]);

  return (
    <header
      className="top-navbar print-hidden"
      role="banner"
      aria-label="Main navigation"
      data-overlay-shield
    >
      <div className="top-navbar__primary">
        <div className="top-navbar__utility-row">
          <button
            type="button"
            className="top-navbar__hamburger"
            onClick={() => dispatch(toggleLeftRail())}
            aria-label="Toggle sidebar"
            title="Toggle sidebar"
          >
            ☰
          </button>
          <span className="top-navbar__workspace-badge">4× upgraded workspace</span>
        </div>

        <div className="top-navbar__brand">
          <img src="/logo.png" alt="White Caves Real Estate" className="top-navbar__logo" />
          <div className="top-navbar__brand-copy">
            <h1>Henry — Document Operations</h1>
            <p>White Caves Real Estate L.L.C · Dubai · DLD/RERA Workflow</p>
            <div className="top-navbar__meta-row">
              <small>
                Policy {policyMeta.version} · Reviewed {policyMeta.reviewedAt}
              </small>
              <span className="top-navbar__meta-pill">Precision filing cockpit</span>
            </div>
          </div>
        </div>
      </div>

      <div
        className="henry-identity"
        role="complementary"
        aria-label="AI Assistant identity"
        ref={identityRef}
      >
        <div className="henry-identity__avatar" aria-hidden="true">
          🤵
        </div>
        <div className="henry-identity__info">
          <p className="henry-identity__name">{henry.name}</p>
          <p className="henry-identity__title">{henry.title}</p>
          <p className="henry-identity__module">Module: {henry.module}</p>
          <span className="henry-identity__status" aria-label={`Henry status: ${henry.status}`}>
            <span className="henry-identity__status-dot" aria-hidden="true" />
            {henry.status}
          </span>
          <button
            type="button"
            className="henry-identity__toggle"
            aria-haspopup="dialog"
            aria-expanded={identityOpen}
            aria-label="Toggle Henry identity details"
            onClick={() => setIdentityOpen((v) => !v)}
          >
            ℹ Details
          </button>
        </div>

        {identityOpen ? (
          <div className="henry-identity__popover" role="dialog" aria-label="Henry identity details">
            <p className="henry-identity__meta">
              <strong>AI ID:</strong> {henry.aiId}
            </p>
            <p className="henry-identity__meta">
              <strong>Module:</strong> {henry.module}
            </p>
            <p className="henry-identity__meta">
              <strong>Last Sync:</strong>{' '}
              {henry.lastSyncedAt
                ? henry.lastSyncedAt.replace('T', ' ').replace('Z', ' UTC')
                : 'Standalone mode'}
            </p>
            <div className="henry-identity__row">
              <button
                type="button"
                className="henry-identity__action"
                onClick={() => {
                  openCommandPalette();
                  setIdentityOpen(false);
                }}
              >
                ⌘ Open palette
              </button>
              <button type="button" className="henry-identity__action" onClick={() => setIdentityOpen(false)}>
                Close
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="top-navbar__actions" aria-label="Document actions">
        <div className="top-navbar__active-doc-wrap">
          <p className="top-navbar__active-doc">Active Document: {activeTemplateLabel}</p>
          <span className="top-navbar__active-doc-chip">
            {currentPage === 'payroll' ? 'Payroll workspace' : 'Live document workspace'}
          </span>
        </div>
        <AutosaveIndicator />
        <div className="top-navbar__action-grid">
          <button
            type="button"
            className="density-toggle payroll-nav-btn"
            onClick={openCommandPalette}
            aria-label="Open command palette (Ctrl+K)"
            title="Command palette (Ctrl+K)"
          >
            ⌘ Search
          </button>
          <button
            type="button"
            className="density-toggle payroll-nav-btn"
            onClick={togglePage}
            aria-label={
              currentPage === 'payroll'
                ? 'Navigate back to Documents'
                : 'Navigate to WPS SIF Payroll Generator'
            }
            title={currentPage === 'payroll' ? 'Back to Documents' : 'WPS SIF Payroll Generator'}
          >
            {currentPage === 'payroll' ? '📄 Documents' : '💳 Payroll'}
          </button>
          <button
            type="button"
            className="density-toggle payroll-nav-btn"
            onClick={goToBuilderPage}
            aria-label="Navigate to Tenancy Contract Builder"
            title="Tenancy Contract Builder"
          >
            🧩 Builder
          </button>
          <button
            type="button"
            className="density-toggle payroll-nav-btn"
            onClick={goToTitleDeedPage}
            aria-label="Navigate to Title Deed Extractor"
            title="Title Deed Extractor"
          >
            🏷️ Title Deed
          </button>
          <button
            type="button"
            className="density-toggle payroll-nav-btn"
            onClick={goToEmiratesIdPage}
            aria-label="Navigate to Emirates ID Extractor"
            title="Emirates ID Extractor"
          >
            🪪 Emirates ID
          </button>
          <button
            type="button"
            className="density-toggle payroll-nav-btn"
            onClick={goToTenantIdentityDocsPage}
            aria-label="Navigate to Tenant Passport and Residence Permit Scanner"
            title="Tenant Passport and Residence Permit Scanner"
          >
            🛂 Tenant Docs
          </button>
          <button
            type="button"
            className="density-toggle"
            onClick={cycleTheme}
            aria-label={`Theme: ${themeMode} (resolved ${themeResolved}). Click to switch to ${THEME_NEXT[themeMode]}.`}
            title={`Theme: ${themeMode} → ${THEME_NEXT[themeMode]}`}
          >
            {THEME_LABEL[themeMode]}
          </button>
          <button
            type="button"
            className="density-toggle"
            onClick={toggleDensity}
            aria-pressed={density === 'compact'}
            title={density === 'compact' ? 'Switch to comfortable density' : 'Switch to compact density'}
          >
            {density === 'compact' ? '▤ Compact' : '▣ Comfortable'}
          </button>
        </div>
      </div>
    </header>
  );
});

TopNavbar.displayName = 'TopNavbar';

export default TopNavbar;
