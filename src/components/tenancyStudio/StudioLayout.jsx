/**
 * [Category 1: View]
 * White Caves Real Estate - Master Tenancy Studio Layout (StudioLayout.jsx)
 * 3-Column Studio Cockpit (Col A: Inputs, Col B: View Pane, Col C: Status & Activities).
 */

import React, { useState } from 'react';
import StudioStepContainer from './StudioStepContainer';
import StudioPdfViewerPane from './StudioPdfViewerPane';
import StudioStatusSidebar from './StudioStatusSidebar';
import StudioFooterBar from './StudioFooterBar';
import StudioToolboxModal from './StudioToolboxModal';
import FullscreenPdfModal from './FullscreenPdfModal';
import ContractDiffModal from './ContractDiffModal';
import useStudioSessionPersistence from '../../hooks/useStudioSessionPersistence';
import '../../styles/tenancy-studio.css';

export const StudioLayout = () => {
  useStudioSessionPersistence();

  const [colACollapsed, setColACollapsed] = useState(false);
  const [colBCollapsed, setColBCollapsed] = useState(false);
  const [colCCollapsed, setColCCollapsed] = useState(false);

  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);

  const toggleFullScreenCanvas = () => {
    const next = !colACollapsed || !colCCollapsed;
    setColACollapsed(next);
    setColCCollapsed(next);
    setColBCollapsed(false);
  };

  const isFullScreenCanvas = colACollapsed && colCCollapsed && !colBCollapsed;
  const shellClasses = [
    'studio-shell',
    colACollapsed && 'col-a-collapsed',
    colBCollapsed && 'col-b-collapsed',
    colCCollapsed && 'col-c-collapsed',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="studio-layout-root">
      <div className={shellClasses}>
        {/* Column A: Document Inputs or Restore Rail */}
        {colACollapsed ? (
          <div
            className="col-a-restore-rail"
            onClick={() => setColACollapsed(false)}
            title="Click to restore Inputs (Column A)"
            role="button"
            tabIndex={0}
          >
            <span>▶ EXPAND INPUTS (COL A)</span>
          </div>
        ) : (
          <StudioStepContainer
            colBCollapsed={colBCollapsed}
            colCCollapsed={colCCollapsed}
            onRestoreColB={() => setColBCollapsed(false)}
            onRestoreColC={() => setColCCollapsed(false)}
            onOpenDiffModal={() => setIsDiffModalOpen(true)}
          />
        )}

        {/* Column B: Live PDF Viewer Pane & Fullscreen Canvas */}
        {colBCollapsed ? (
          <div
            className="col-b-restore-rail"
            onClick={() => setColBCollapsed(false)}
            title="Click to restore Document Preview (Column B)"
            role="button"
            tabIndex={0}
          >
            <span>📄 EXPAND PREVIEW (COL B)</span>
          </div>
        ) : (
          <StudioPdfViewerPane
            onToggleColA={() => setColACollapsed(!colACollapsed)}
            isColACollapsed={colACollapsed}
            onToggleColC={() => setColCCollapsed(!colCCollapsed)}
            isColCCollapsed={colCCollapsed}
            onToggleColB={() => setColBCollapsed(true)}
            onToggleFullScreenCanvas={toggleFullScreenCanvas}
            isFullScreenCanvas={isFullScreenCanvas}
          />
        )}

        {/* Column C: Status, Activities & Verification Gates */}
        {colCCollapsed ? (
          <div
            className="col-c-restore-rail"
            onClick={() => setColCCollapsed(false)}
            title="Click to restore Status & Activities (Column C)"
            role="button"
            tabIndex={0}
          >
            <span>◀ EXPAND STATUS (COL C)</span>
          </div>
        ) : (
          <StudioStatusSidebar onCollapse={() => setColCCollapsed(true)} />
        )}
      </div>

      <StudioFooterBar />
      <StudioToolboxModal />
      <FullscreenPdfModal isOpen={isPdfModalOpen} onClose={() => setIsPdfModalOpen(false)} />
      <ContractDiffModal isOpen={isDiffModalOpen} onClose={() => setIsDiffModalOpen(false)} />
    </div>
  );
};

export default StudioLayout;
