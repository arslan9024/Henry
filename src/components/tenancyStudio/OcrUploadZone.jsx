/**
 * [Category 1: View]
 * White Caves Real Estate - OCR Document Ingestion Dropzone
 * Drag-and-drop parser for Emirates ID, Title Deed, or Renewal Contract (< 60 lines, 0 inline CSS).
 */

import React, { useState, useRef } from 'react';
import { useOcrIngestion } from '../../hooks/useOcrIngestion';
import { OcrStatusMessage } from './OcrStatusMessage';

export const OcrUploadZone = () => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const { ingestionStatus, processFile } = useOcrIngestion();

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      className={`ocr-upload-zone ${isDragging ? 'ocr-upload-zone--dragging' : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      role="button"
      tabIndex={0}
      aria-label="Upload document for smart OCR extraction"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.txt"
        className="ocr-hidden-input"
        onChange={(e) => {
          if (e.target.files?.[0]) processFile(e.target.files[0]);
        }}
      />
      <div className="ocr-upload-title">
        📄 <strong>Smart OCR Dropzone</strong> — Drag &amp; Drop Tenant Emirates ID, Title Deed, or Renewal
        Contract
      </div>
      <div className="ocr-upload-subtitle">
        Auto-extracts Tenant Names, ID Numbers, Dates &amp; Makani reference numbers
      </div>
      <OcrStatusMessage status={ingestionStatus} />
    </div>
  );
};

export default OcrUploadZone;
