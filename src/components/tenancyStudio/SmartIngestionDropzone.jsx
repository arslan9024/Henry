/**
 * [Category 1: View]
 * White Caves Real Estate - Smart Ingestion Dropzone Orchestrator
 * Clean Single-Purpose Architecture (< 45 lines, 0 inline CSS).
 */

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import DealPresetsBar from './DealPresetsBar';
import OcrUploadZone from './OcrUploadZone';
import ChequeScheduleModal from './ChequeScheduleModal';
import { calculateChequeSchedule } from '../../services/tenancyStudio/chequeCalculator';

export const SmartIngestionDropzone = () => {
  const page1 = useSelector((state) => state.tenancyStudio.page1);
  const chequeCount = useSelector((state) => state.tenancyStudio.chequeCount || 4);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const schedule = calculateChequeSchedule({
    annualRent: page1.annual_rent,
    chequeCount,
    startDate: page1.date_from || '01-10-2026',
  });

  return (
    <div className="smart-ingestion-card">
      <DealPresetsBar onOpenSchedule={() => setShowScheduleModal(true)} />
      <OcrUploadZone />
      <ChequeScheduleModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        schedule={schedule}
        chequeCount={chequeCount}
        annualRent={page1.annual_rent}
        startDate={page1.date_from}
      />
    </div>
  );
};

export default SmartIngestionDropzone;
