/**
 * [Category 1: View]
 * CompilationStatusBanner - Real-time compilation readiness banner for Step 4 (< 45 lines, 0 inline CSS).
 */

import React from 'react';
import PropTypes from 'prop-types';

export const CompilationStatusBanner = ({ lastCompiledBlobUrl, lastFileName }) => {
  const isReady = Boolean(lastCompiledBlobUrl);

  return (
    <div
      className={`compilation-banner ${isReady ? 'compilation-banner--ready' : 'compilation-banner--pending'}`}
      role="status"
    >
      {isReady ? (
        <div>
          <strong>✓ Tenancy Package Ready!</strong> File <code>{lastFileName}</code> is compiled. Click{' '}
          <strong>⬇ Download Final PDF</strong> or <strong>💬 WhatsApp</strong> in the bottom bar.
        </div>
      ) : (
        <div>
          ⏳ Ready to compile. Click <strong>⚡ Process Selected PDF</strong> in the bottom bar to generate
          the binary package.
        </div>
      )}
    </div>
  );
};

CompilationStatusBanner.propTypes = {
  lastCompiledBlobUrl: PropTypes.string,
  lastFileName: PropTypes.string,
};

export default CompilationStatusBanner;
