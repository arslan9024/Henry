/**
 * [Category 1: View]
 * White Caves Real Estate - Studio Sticky Bottom Footer Bar Orchestrator
 * Clean Single-Purpose Architecture (< 50 lines).
 */

import React, { useState } from 'react';
import StudioFooterStepNav from './StudioFooterStepNav';
import StudioDocScopeSelector from './StudioDocScopeSelector';
import StudioExportActions from './StudioExportActions';

export const StudioFooterBar = () => {
  const [combineContract, setCombineContract] = useState(true);
  const [combineAddendum, setCombineAddendum] = useState(true);
  const [combineReceipt, setCombineReceipt] = useState(true);

  return (
    <footer className="studio-footer" role="toolbar" aria-label="Tenancy Studio Actions">
      <div className="studio-footer-inner">
        <StudioFooterStepNav />
        <StudioDocScopeSelector
          combineContract={combineContract}
          setCombineContract={setCombineContract}
          combineAddendum={combineAddendum}
          setCombineAddendum={setCombineAddendum}
          combineReceipt={combineReceipt}
          setCombineReceipt={setCombineReceipt}
        />
        <StudioExportActions
          combineContract={combineContract}
          combineAddendum={combineAddendum}
          combineReceipt={combineReceipt}
        />
      </div>
    </footer>
  );
};

export default StudioFooterBar;
