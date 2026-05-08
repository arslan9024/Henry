import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectActiveTemplateLabel, selectPolicyMeta, selectHenry } from '../store/selectors';
import { toggleLeftRail } from '../store/uiCommandSlice';
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
  const { density, toggle: toggleDensity } = useDensity();
  const { mode: themeMode, resolved: themeResolved, cycle: cycleTheme } = useTheme();
  const [identityOpen, setIdentityOpen] = useState(false);
  const identityRef = useRef(null);

  const openCommandPalette = useCallback(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
  }, []);

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
      <button
        type="button"
        className="top-navbar__hamburger"
        onClick={() => dispatch(toggleLeftRail())}
        aria-label="Toggle sidebar"
        title="Toggle sidebar"
      >
        ☰
      </button>

      <div className="top-navbar__brand">
        <img src="/logo.png" alt="White Caves Real Estate" className="top-navbar__logo" />
        <div>
          <h1>Henry — Document Operations</h1>
          <p>White Caves Real Estate L.L.C · Dubai · DLD/RERA Workflow</p>
          <small>
            Policy {policyMeta.version} · Reviewed {policyMeta.reviewedAt}
          </small>
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
        <p className="top-navbar__active-doc">Active Document: {activeTemplateLabel}</p>
        <AutosaveIndicator />
        <button
          type="button"
          className="density-toggle"
          onClick={openCommandPalette}
          aria-label="Open command palette (Ctrl+K)"
          title="Command palette (Ctrl+K)"
        >
          ⌘ Search
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
    </header>
  );
});

TopNavbar.displayName = 'TopNavbar';

export default TopNavbar;
