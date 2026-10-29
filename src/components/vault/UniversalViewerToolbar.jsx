/**
 * [Category 1: View]
 * White Caves Real Estate - Universal Viewer Toolbar (UniversalViewerToolbar.jsx)
 * Clean single-purpose presentation component (< 75 lines, zero inline CSS).
 */

import React from 'react';

export const UniversalViewerToolbar = ({ activeDoc, zoom, setZoom, onClose }) => {
  return (
    <div className="universal-viewer__toolbar">
      <div className="universal-viewer__title-wrap">
        <span className="universal-viewer__icon">📄</span>
        <div>
          <h3 className="universal-viewer__title">{activeDoc.title || 'Document View'}</h3>
          <p className="universal-viewer__subtitle">
            {activeDoc.tenantName ? `Tenant: ${activeDoc.tenantName} · ` : ''}
            {activeDoc.propertyNo ? `Unit: ${activeDoc.propertyNo} · ` : ''}
            {activeDoc.documentType || 'General Record'}
          </p>
        </div>
      </div>

      <div className="universal-viewer__controls">
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
          className="universal-viewer__zoom-btn"
          title="Zoom out"
        >
          −
        </button>
        <span className="universal-viewer__zoom-text">{Math.round(zoom * 100)}%</span>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(1.8, z + 0.15))}
          className="universal-viewer__zoom-btn"
          title="Zoom in"
        >
          +
        </button>

        {activeDoc.blobUrl && (
          <a
            href={activeDoc.blobUrl}
            download={activeDoc.fileName || 'White_Caves_Document.pdf'}
            className="universal-viewer__download-btn"
          >
            ⬇ Download
          </a>
        )}

        <button
          type="button"
          onClick={onClose}
          aria-label="Close Document Viewer"
          className="universal-viewer__close-btn"
        >
          ✕ Close
        </button>
      </div>
    </div>
  );
};

export default React.memo(UniversalViewerToolbar);
