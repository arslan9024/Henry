/**
 * [Category 1: View]
 * OcrStatusMessage - Renders real-time extraction feedback for OCR dropzone (< 30 lines, 0 inline CSS).
 */

import React from 'react';
import PropTypes from 'prop-types';

export const OcrStatusMessage = ({ status }) => {
  if (!status) return null;

  return (
    <div className="ocr-upload-status" role="status" aria-live="polite">
      {status}
    </div>
  );
};

OcrStatusMessage.propTypes = {
  status: PropTypes.string,
};

export default OcrStatusMessage;
