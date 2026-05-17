import React, { useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import PrintButton from './PrintButton';
import PrintPreview from './PrintPreview';
import useFocusTrap from '../hooks/useFocusTrap';
import useBackgroundInert from '../hooks/useBackgroundInert';
import { selectActiveTemplateLabel, selectCanGeneratePdf } from '../store/selectors';

/**
 * PrintPreviewModal
 *
 * A full-screen modal that displays the live PDF preview (iframe) alongside
 * the full generate-PDF workflow (Save Draft, Generate PDF buttons).
 *
 * The modal re-uses:
 *   • PrintPreview — renders the live @react-pdf/renderer blob into an iframe
 *   • PrintButton  — handles Save Draft + Generate PDF + audit log + archive
 *
 * Props:
 *   isOpen  {boolean} — whether the modal is visible
 *   onClose {function} — callback to close the modal
 */
const PrintPreviewModal = ({ isOpen, onClose }) => {
  const activeTemplateLabel = useSelector(selectActiveTemplateLabel);
  const canGeneratePdf = useSelector(selectCanGeneratePdf);

  const panelRef = useFocusTrap(isOpen);
  useBackgroundInert(isOpen);

  // Escape key closes modal
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const handleClose = useCallback(() => onClose(), [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="ppm-overlay print-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="PDF print preview"
      onClick={(e) => {
        // Close on backdrop click (not panel click)
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="ppm-panel" ref={panelRef} tabIndex={-1}>
        {/* ── Header ───────────────────────────────────────────────────── */}
        <header className="ppm-header">
          <div className="ppm-header__info">
            <span className="ppm-header__icon" aria-hidden="true">
              📄
            </span>
            <h2 className="ppm-header__title" title={activeTemplateLabel}>
              {activeTemplateLabel}
            </h2>
            {canGeneratePdf && <span className="ppm-header__badge">PDF Preview</span>}
            {!canGeneratePdf && (
              <span className="ppm-header__badge ppm-header__badge--warn">Screen only</span>
            )}
          </div>
          <button
            type="button"
            className="ppm-close"
            onClick={handleClose}
            aria-label="Close preview"
            title="Close (Esc)"
          >
            ✕
          </button>
        </header>

        {/* ── Body: PDF iframe ─────────────────────────────────────────── */}
        <div className="ppm-body">
          {canGeneratePdf ? (
            <PrintPreview />
          ) : (
            <div className="ppm-no-pdf">
              <div className="ppm-no-pdf__icon" aria-hidden="true">
                🖨
              </div>
              <h3>PDF export not available</h3>
              <p>
                This template does not yet have a dedicated PDF renderer. Use <strong>🖨 Print</strong> below
                to print via the browser.
              </p>
            </div>
          )}
        </div>

        {/* ── Footer: action buttons ───────────────────────────────────── */}
        <footer className="ppm-footer">
          <div className="ppm-footer__actions">
            <PrintButton />
          </div>
          <button type="button" className="ppm-footer__close-btn" onClick={handleClose}>
            ✕ Close
          </button>
        </footer>
      </div>
    </div>
  );
};

export default React.memo(PrintPreviewModal);
