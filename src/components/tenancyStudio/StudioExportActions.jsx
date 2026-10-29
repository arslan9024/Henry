/**
 * [Category 1: View]
 * White Caves Real Estate - Studio Export & Download Actions (StudioExportActions.jsx)
 * Clean single-purpose view component (< 75 lines, zero inline CSS).
 */

import React from 'react';
import useStudioCompilationAndExport from '../../hooks/useStudioCompilationAndExport';

export const StudioExportActions = ({ combineContract, combineAddendum, combineReceipt }) => {
  const { isCompiling, handleProcessPdf, handleDownload, handleShareWhatsApp, handleOpenPreviewModal } =
    useStudioCompilationAndExport({ combineContract, combineAddendum, combineReceipt });

  return (
    <div className="studio-footer-right" role="group" aria-label="Export Actions">
      <button
        type="button"
        className="footer-btn footer-btn-process"
        onClick={handleProcessPdf}
        disabled={isCompiling}
      >
        <span>⚡</span>
        <span>{isCompiling ? 'Compiling PDF...' : 'Process Selected PDF'}</span>
      </button>

      <button
        type="button"
        className="footer-btn footer-btn-view-modal"
        onClick={handleOpenPreviewModal}
        title="Inspect in Fullscreen View Modal"
      >
        <span>👁️</span>
        <span>View Modal</span>
      </button>

      <button
        type="button"
        className="footer-btn footer-btn-download"
        onClick={handleDownload}
        title="Download compiled vector PDF"
      >
        <span>⬇</span>
        <span>Download</span>
      </button>

      <button
        type="button"
        className="footer-btn footer-btn-whatsapp"
        onClick={handleShareWhatsApp}
        title="Share summary via WhatsApp"
      >
        <span>💬</span>
        <span>WhatsApp</span>
      </button>
    </div>
  );
};

export default StudioExportActions;
