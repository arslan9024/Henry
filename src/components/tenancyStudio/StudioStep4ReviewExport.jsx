/**
 * [Category 1: View]
 * White Caves Real Estate - Step 4: Package Summary & Client Export Orchestrator
 * Clean Single-Purpose Architecture (< 50 lines, 0 inline CSS).
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveViewingPage } from '../../store/tenancyStudioSlice';
import { CompilationStatusBanner } from './CompilationStatusBanner';
import { PageQuickJumpCard } from './PageQuickJumpCard';
import ClientHandoverSummaryCard from './ClientHandoverSummaryCard';
import OnboardingChecklistCard from './OnboardingChecklistCard';

export const StudioStep4ReviewExport = () => {
  const dispatch = useDispatch();
  const confirmations = useSelector((state) => state.tenancyStudio.confirmations);

  return (
    <div className="step-wrapper">
      <div className="step-header-banner">
        <h2>⚙️ Step 4: Package Summary, Verification &amp; Client Export</h2>
        <p>
          Select documents in the bottom bar, click <strong>⚡ Process Selected PDF</strong> to compile, and
          download or share via WhatsApp.
        </p>
      </div>

      <CompilationStatusBanner
        lastCompiledBlobUrl={confirmations.lastCompiledBlobUrl}
        lastFileName={confirmations.lastFileName}
      />

      <PageQuickJumpCard onJump={(num) => dispatch(setActiveViewingPage(num))} />

      <ClientHandoverSummaryCard />

      <OnboardingChecklistCard />
    </div>
  );
};

export default StudioStep4ReviewExport;
