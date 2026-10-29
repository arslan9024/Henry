/**
 * [Category 1: View]
 * White Caves Real Estate - Universal Document View Modal (UniversalDocumentViewModal.jsx)
 * Clean single-purpose orchestrator component (< 65 lines, zero inline CSS).
 */

import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearActivePreviewDoc } from '../../store/documentVaultSlice';
import { useModalA11y } from '../../hooks/useModalA11y';
import UniversalViewerToolbar from './UniversalViewerToolbar';

export const UniversalDocumentViewModal = () => {
  const dispatch = useDispatch();
  const activeDoc = useSelector((state) => state.documentVault?.activePreviewDoc);
  const [zoom, setZoom] = useState(1.0);

  const handleClose = useCallback(() => {
    dispatch(clearActivePreviewDoc());
  }, [dispatch]);

  const trapRef = useModalA11y(Boolean(activeDoc), handleClose);

  if (!activeDoc) return null;

  return (
    <div
      ref={trapRef}
      role="dialog"
      aria-modal="true"
      aria-label="Universal Document Viewer"
      className="universal-viewer__backdrop"
    >
      <UniversalViewerToolbar activeDoc={activeDoc} zoom={zoom} setZoom={setZoom} onClose={handleClose} />

      <div className="universal-viewer__body">
        {activeDoc.blobUrl ? (
          <iframe
            src={activeDoc.blobUrl}
            title={activeDoc.title}
            className="universal-viewer__iframe"
            style={{
              width: `${750 * zoom}px`,
              height: `${1050 * zoom}px`,
            }}
          />
        ) : (
          <div className="universal-viewer__preview-details">
            <p className="universal-viewer__preview-title">📋 Document Record Details</p>
            <pre className="universal-viewer__json-pre">{JSON.stringify(activeDoc, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default UniversalDocumentViewModal;
