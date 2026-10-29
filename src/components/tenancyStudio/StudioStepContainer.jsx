/**
 * [Category 1: View]
 * White Caves Real Estate - Studio Step Container (StudioStepContainer.jsx)
 * Orchestrates Steps 1-4 and floating uncollapse strips (< 75 lines, 0 inline CSS).
 */

import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import StudioStep1DealInputs from './StudioStep1DealInputs';
import StudioStep2Addendum from './StudioStep2Addendum';
import StudioStep3Receipt from './StudioStep3Receipt';
import StudioStep4ReviewExport from './StudioStep4ReviewExport';

export const StudioStepContainer = ({
  colBCollapsed,
  colCCollapsed,
  onRestoreColB,
  onRestoreColC,
  onOpenDiffModal,
}) => {
  const currentStep = useSelector((state) => state.tenancyStudio.currentStep || 1);

  const renderActiveStep = () => {
    switch (currentStep) {
      case 1:
        return <StudioStep1DealInputs onOpenDiffModal={onOpenDiffModal} />;
      case 2:
        return <StudioStep2Addendum />;
      case 3:
        return <StudioStep3Receipt />;
      case 4:
        return <StudioStep4ReviewExport />;
      default:
        return <StudioStep1DealInputs onOpenDiffModal={onOpenDiffModal} />;
    }
  };

  return (
    <main className="col-a-inputs" aria-label="Column A: Document Inputs & Editors">
      {colBCollapsed && (
        <div
          onClick={onRestoreColB}
          className="uncollapse-strip uncollapse-strip--col-b"
          title="Click to restore Center PDF Viewport"
          role="button"
          tabIndex={0}
        >
          <span>📄</span>
          <span>Show Center PDF Viewport (Column B)</span>
        </div>
      )}

      {colCCollapsed && (
        <div
          onClick={onRestoreColC}
          className="uncollapse-strip uncollapse-strip--col-c"
          title="Click to restore Right Status Sidebar"
          role="button"
          tabIndex={0}
        >
          <span>📊</span>
          <span>Show Right Status Sidebar (Column C)</span>
        </div>
      )}

      {renderActiveStep()}
    </main>
  );
};

StudioStepContainer.propTypes = {
  colBCollapsed: PropTypes.bool,
  colCCollapsed: PropTypes.bool,
  onRestoreColB: PropTypes.func.isRequired,
  onRestoreColC: PropTypes.func.isRequired,
  onOpenDiffModal: PropTypes.func.isRequired,
};

export default StudioStepContainer;
