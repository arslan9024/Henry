import React from 'react';
import { useSelector } from 'react-redux';
import PrintButton from './PrintButton';
import { selectActiveTemplateLabel, selectPolicyMeta, selectHenry } from '../store/selectors';

const TopNavbar = React.memo(() => {
  const policyMeta = useSelector(selectPolicyMeta);
  const activeTemplateLabel = useSelector(selectActiveTemplateLabel);
  const henry = useSelector(selectHenry);

  return (
    <header className="top-navbar print-hidden" role="banner" aria-label="Main navigation">

      {/* ── LEFT: Company Brand ─────────────────────────────────────── */}
      <div className="top-navbar__brand">
        <img src="/logo.png.png" alt="White Caves Real Estate" className="top-navbar__logo" />
        <div>
          <h1>Henry — Document Operations</h1>
          <p>White Caves Real Estate L.L.C | Dubai | DLD/RERA Workflow</p>
          <small>
            Policy {policyMeta.version} • Reviewed {policyMeta.reviewedAt} • {policyMeta.reviewedBy}
          </small>
        </div>
      </div>

      {/* ── CENTER: Henry Identity Block ────────────────────────────── */}
      <div className="henry-identity" role="complementary" aria-label="AI Assistant identity">
        <div className="henry-identity__avatar" aria-hidden="true">🤵</div>
        <div className="henry-identity__info">
          <p className="henry-identity__name">{henry.name}</p>
          <p className="henry-identity__title">{henry.title}</p>
          <p className="henry-identity__module">Module: {henry.module}</p>
          <span className="henry-identity__status" aria-label={`Henry status: ${henry.status}`}>
            <span className="henry-identity__status-dot" aria-hidden="true" />
            {henry.status}
          </span>
        </div>
      </div>

      {/* ── RIGHT: Document Actions ──────────────────────────────────── */}
      <div className="top-navbar__actions" aria-label="Document actions">
        <p className="top-navbar__active-doc">Active Document: {activeTemplateLabel}</p>
        <PrintButton />
      </div>

    </header>
  );
});

TopNavbar.displayName = 'TopNavbar';

export default TopNavbar;
