/**
 * [Category 1: View]
 * White Caves Real Estate - Studio Tool Box Configuration Modal (StudioToolboxModal.jsx)
 * Clean single-purpose component (< 95 lines, zero inline CSS).
 */

import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleToolboxModal, setToolboxOption } from '../../store/tenancyStudioSlice';
import {
  TOOLBOX_PDF_ENGINES,
  TOOLBOX_EXTRACTION_MODES,
  TOOLBOX_DOCUMENT_SCOPES,
} from '../../config/tenancyStudio/workflowConfig';
import { useModalA11y } from '../../hooks/useModalA11y';
import ToolboxOptionGroup from './ToolboxOptionGroup';

export const StudioToolboxModal = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.tenancyStudio?.toolbox?.isToolboxOpen);
  const toolbox = useSelector((state) => state.tenancyStudio?.toolbox || {});

  const handleClose = useCallback(() => {
    dispatch(toggleToolboxModal(false));
  }, [dispatch]);

  const trapRef = useModalA11y(isOpen, handleClose);

  if (!isOpen) return null;

  return (
    <div
      className="toolbox-modal__backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Tenancy Studio Toolbox Settings"
      onClick={handleClose}
    >
      <div ref={trapRef} className="toolbox-modal__dialog" onClick={(e) => e.stopPropagation()}>
        <div className="toolbox-modal__header">
          <div>
            <h3 className="toolbox-modal__title">🧰 Tenancy Studio Tool Box</h3>
            <p className="toolbox-modal__subtitle">
              Select your preferred operational engines and compilation scope.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="toolbox-modal__close-btn"
            aria-label="Close toolbox"
          >
            ✕
          </button>
        </div>

        <ToolboxOptionGroup
          title="1. PDF Generation Engine Mode:"
          name="pdfEngine"
          options={TOOLBOX_PDF_ENGINES}
          currentValue={toolbox.pdfEngine}
          activeColor="#2563eb"
          activeBg="#eff6ff"
          onSelect={(val) => dispatch(setToolboxOption({ key: 'pdfEngine', value: val }))}
        />

        <ToolboxOptionGroup
          title="2. Document Compilation Scope:"
          name="documentScope"
          options={TOOLBOX_DOCUMENT_SCOPES}
          currentValue={toolbox.documentScope}
          activeColor="#059669"
          activeBg="#ecfdf5"
          onSelect={(val) => dispatch(setToolboxOption({ key: 'documentScope', value: val }))}
        />

        <ToolboxOptionGroup
          title="3. Smart AI Document Extraction:"
          name="extractionMode"
          options={TOOLBOX_EXTRACTION_MODES}
          currentValue={toolbox.extractionMode}
          activeColor="#7c3aed"
          activeBg="#f5f3ff"
          onSelect={(val) => dispatch(setToolboxOption({ key: 'extractionMode', value: val }))}
        />

        <div className="toolbox-modal__footer">
          <button type="button" onClick={handleClose} className="toolbox-modal__apply-btn">
            Apply &amp; Close Tool Box
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudioToolboxModal;
