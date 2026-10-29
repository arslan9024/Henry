/**
 * [Category 1: View]
 * White Caves Real Estate - 1-Click Deal Presets & Cheque Frequency Bar (DealPresetsBar.jsx)
 * Clean single-purpose orchestrator (< 35 lines, zero inline CSS).
 */

import React from 'react';
import DealPresetsPills from './DealPresetsPills';
import DealChequesPdcBar from './DealChequesPdcBar';

export const DealPresetsBar = ({ onOpenSchedule }) => {
  return (
    <>
      <DealPresetsPills />
      <DealChequesPdcBar onOpenSchedule={onOpenSchedule} />
    </>
  );
};

export default React.memo(DealPresetsBar);
