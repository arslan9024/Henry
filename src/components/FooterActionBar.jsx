import React from 'react';
import PrintButton from './PrintButton';

const FooterActionBar = ({
  activeTemplateLabel,
  canGeneratePdf,
  onOpenPreviewModal,
  onOpenCompliance,
  onRunComplianceCheck,
  onOpenArchive,
  onOpenAudit,
  badgeTone,
  badgeLabel,
  badgeTitle,
}) => {
  return (
    <footer
      className="footer-action-bar print-hidden"
      role="contentinfo"
      aria-label="Document footer actions"
    >
      {/* LEFT: template name + live compliance badge */}
      <div className="footer-action-bar__left">
        <span className="footer-doc-label" title={activeTemplateLabel}>
          📄 {activeTemplateLabel}
        </span>
        <button
          type="button"
          className={`compliance-badge compliance-badge--${badgeTone}`}
          title={badgeTitle}
          aria-label={`Compliance: ${badgeLabel} — click to view`}
          onClick={onOpenCompliance}
        >
          {badgeTone === 'clear' ? '✓' : badgeTone === 'critical' ? '✕' : '!'} {badgeLabel}
        </button>
      </div>

      {/* RIGHT: action buttons */}
      <div className="footer-action-bar__right">
        <button
          type="button"
          className="preview-toggle-btn"
          onClick={onOpenPreviewModal}
          disabled={!canGeneratePdf}
          title={
            canGeneratePdf ? 'Open PDF preview &amp; export' : 'PDF preview not available for this template'
          }
          aria-label="Open PDF preview"
        >
          📄 Preview PDF
        </button>

        <button
          type="button"
          className="compliance-check-btn"
          onClick={onRunComplianceCheck}
          title="Audit current document against RERA / DLD compliance rules"
        >
          ✅ Check
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
    </footer>
  );
};

export default React.memo(FooterActionBar);
