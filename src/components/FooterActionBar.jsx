import React, { useEffect, useState } from 'react';
import PrintButton from './PrintButton';
import { STORAGE_KEY_FOOTER_BAR } from '../constants/storageKeys';

const readFooterState = () => {
  try {
    const v = localStorage.getItem(STORAGE_KEY_FOOTER_BAR);
    if (v === 'collapsed') return true;
  } catch {
    /* ignore */
  }
  return false;
};

const FooterActionBar = ({
  activeTemplateLabel,
  previewMode,
  canGeneratePdf,
  onTogglePreview,
  onOpenCompliance,
  onRunComplianceCheck,
  onOpenArchive,
  onOpenAudit,
  badgeTone,
  badgeLabel,
  badgeTitle,
}) => {
  const [collapsed, setCollapsed] = useState(readFooterState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FOOTER_BAR, collapsed ? 'collapsed' : 'expanded');
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  return (
    <footer
      className="footer-action-bar print-hidden"
      role="contentinfo"
      aria-label="Document footer actions"
    >
      <div className="footer-action-bar__header">
        <div className="footer-action-bar__title-group">
          <p className="footer-action-bar__title">Action Center</p>
          <p className="footer-action-bar__template-label" title={activeTemplateLabel}>
            {activeTemplateLabel}
          </p>
        </div>
        <button
          type="button"
          className="footer-action-bar__collapse-toggle"
          onClick={() => setCollapsed((v) => !v)}
          aria-expanded={!collapsed}
          aria-controls="footer-action-controls"
          title={collapsed ? 'Expand action center' : 'Collapse action center'}
        >
          {collapsed ? '▴ Expand' : '▾ Collapse'}
        </button>
      </div>

      {!collapsed ? (
        <div className="footer-action-bar__controls" id="footer-action-controls">
          <button
            type="button"
            className={`preview-toggle-btn ${previewMode ? 'active' : ''}`}
            onClick={onTogglePreview}
            disabled={!canGeneratePdf && !previewMode}
            title={
              canGeneratePdf ? 'Toggle A4 vector preview' : 'PDF preview not available for this template'
            }
          >
            {previewMode ? '✏️  Edit Form' : '👁  Toggle Print Preview'}
          </button>

          <button
            type="button"
            className={`compliance-badge compliance-badge--${badgeTone}`}
            title={badgeTitle}
            aria-label={`Compliance status: ${badgeLabel} — open checklist`}
            onClick={onOpenCompliance}
          >
            {badgeTone === 'clear' ? '✓' : badgeTone === 'critical' ? '✕' : '!'} {badgeLabel}
          </button>

          <button
            type="button"
            className="compliance-check-btn"
            onClick={onRunComplianceCheck}
            title="Audit current document against RERA / DLD compliance rules"
          >
            ✅ Compliance Check
          </button>

          <button
            type="button"
            className="panel-link-btn"
            onClick={onOpenArchive}
            title="Open archive history"
            aria-label="Open archive history"
          >
            🗂 Archive
          </button>

          <button
            type="button"
            className="panel-link-btn"
            onClick={onOpenAudit}
            title="Open audit log"
            aria-label="Open audit log"
          >
            📜 Audit
          </button>

          <div className="footer-action-bar__actions">
            <PrintButton />
          </div>
        </div>
      ) : null}
    </footer>
  );
};

export default React.memo(FooterActionBar);
