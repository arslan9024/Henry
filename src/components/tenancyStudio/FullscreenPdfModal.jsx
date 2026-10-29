/**
 * [Category 1: View]
 * White Caves Real Estate - Fullscreen Multi-Page PDF Preview Modal (FullscreenPdfModal.jsx)
 * Clean single-purpose orchestrator component (< 65 lines, zero inline CSS).
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useModalA11y } from '../../hooks/useModalA11y';
import VisualPlaygroundCanvas from './VisualPlaygroundCanvas';
import FullscreenPdfToolbar from './FullscreenPdfToolbar';

export const FullscreenPdfModal = ({ isOpen, onClose }) => {
  const [modalPage, setModalPage] = useState(1);
  const [modalZoom, setModalZoom] = useState(1.1);
  const confirmations = useSelector((state) => state.tenancyStudio?.confirmations || {});
  const page1 = useSelector((state) => state.tenancyStudio?.page1 || {});
  const trapRef = useModalA11y(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div
      ref={trapRef}
      role="dialog"
      aria-modal="true"
      aria-label="Fullscreen Document Preview"
      className="fullscreen-modal__backdrop"
    >
      <FullscreenPdfToolbar
        propertyNo={page1.property_no}
        buildingName={page1.building_name}
        modalPage={modalPage}
        setModalPage={setModalPage}
        modalZoom={modalZoom}
        setModalZoom={setModalZoom}
        lastCompiledBlobUrl={confirmations.lastCompiledBlobUrl}
        lastFileName={confirmations.lastFileName}
        onClose={onClose}
      />

      <div className="fullscreen-modal__viewport">
        <div
          style={{
            transform: `scale(${modalZoom})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out',
          }}
        >
          <VisualPlaygroundCanvas pageNumber={modalPage <= 3 ? modalPage : 1} isInteractive={false} />
        </div>
      </div>
    </div>
  );
};

FullscreenPdfModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default FullscreenPdfModal;
