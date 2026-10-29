/**
 * [Category 1: View]
 * White Caves Real Estate - Fullscreen PDF Preview Modal Toolbar
 * Page switcher, zoom controls, download action, and close button (< 75 lines, zero inline CSS).
 */

import React from 'react';

export const FullscreenPdfToolbar = ({
  propertyNo,
  buildingName,
  modalPage,
  setModalPage,
  modalZoom,
  setModalZoom,
  lastCompiledBlobUrl,
  lastFileName,
  onClose,
}) => {
  return (
    <div className="fullscreen-modal__toolbar">
      <div className="fullscreen-modal__title-wrap">
        <span className="fullscreen-modal__icon">👁️</span>
        <div>
          <h3 className="fullscreen-modal__title">
            Preview: {propertyNo || 'Unit'}, {buildingName || 'Property'}
          </h3>
          <p className="fullscreen-modal__subtitle">
            6-Page DLD Contract, RERA Addendum &amp; Payment Receipt
          </p>
        </div>
      </div>

      <div className="fullscreen-modal__controls">
        <div className="fullscreen-modal__pages-wrap">
          {[1, 2, 3, 4, 5, 6, 7].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setModalPage(p)}
              className={`fullscreen-modal__page-btn ${modalPage === p ? 'is-active' : ''}`}
            >
              P{p}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setModalZoom((z) => Math.max(0.7, z - 0.15))}
          className="fullscreen-modal__zoom-btn"
          title="Zoom out"
        >
          −
        </button>
        <span className="fullscreen-modal__zoom-text">{Math.round(modalZoom * 100)}%</span>
        <button
          type="button"
          onClick={() => setModalZoom((z) => Math.min(1.6, z + 0.15))}
          className="fullscreen-modal__zoom-btn"
          title="Zoom in"
        >
          +
        </button>
      </div>

      <div className="fullscreen-modal__actions">
        {lastCompiledBlobUrl && (
          <a
            href={lastCompiledBlobUrl}
            download={lastFileName || 'Tenancy_Package.pdf'}
            className="fullscreen-modal__download-btn"
          >
            ⬇ Download
          </a>
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Preview"
          className="fullscreen-modal__close-btn"
        >
          ✕ Close
        </button>
      </div>
    </div>
  );
};

export default React.memo(FullscreenPdfToolbar);
