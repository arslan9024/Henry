/**
 * [Category 1: View]
 * White Caves Real Estate - Step 1: Deal & DLD Inputs Orchestrator
 * Clean Single-Purpose Architecture (< 45 lines, 0 inline CSS).
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import StudioDealModeSelector from './StudioDealModeSelector';
import SmartIngestionDropzone from './SmartIngestionDropzone';
import StudioDldFieldGrid from './StudioDldFieldGrid';
import StudioClausesEditor from './StudioClausesEditor';

export const StudioStep1DealInputs = ({ onOpenDiffModal }) => {
  const [contractMode, setContractMode] = useState('renewal');

  return (
    <div className="step-wrapper">
      <div className="step-header-banner">
        <h2>📝 Step 1: Deal Intake &amp; Official DLD Tenancy Contract Inputs</h2>
        <p>
          Select contract mode, use 1-click presets or drop an Emirates ID/Title Deed for instant
          auto-extraction.
        </p>
      </div>

      <StudioDealModeSelector
        contractMode={contractMode}
        onModeChange={setContractMode}
        onOpenDiffModal={onOpenDiffModal}
      />

      <SmartIngestionDropzone />

      <StudioDldFieldGrid />

      <StudioClausesEditor />
    </div>
  );
};

StudioStep1DealInputs.propTypes = {
  onOpenDiffModal: PropTypes.func.isRequired,
};

export default StudioStep1DealInputs;
