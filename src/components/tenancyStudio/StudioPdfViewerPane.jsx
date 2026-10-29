/**
 * [Category 1: View]
 * White Caves Real Estate - Studio Center PDF Viewer Pane Orchestrator
 * Clean Single-Purpose Architecture (< 60 lines).
 */

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import ViewerToolbar from './ViewerToolbar';
import CalibrationSubbar from './CalibrationSubbar';
import VisualPlaygroundCanvas from './VisualPlaygroundCanvas';

export const StudioPdfViewerPane = ({
  onToggleColA,
  isColACollapsed,
  onToggleColC,
  isColCCollapsed,
  onToggleColB,
  onToggleFullScreenCanvas,
  isFullScreenCanvas,
}) => {
  const activeViewingPage = useSelector((state) => state.tenancyStudio.activeViewingPage);
  const [showCalibrationTools, setShowCalibrationTools] = useState(false);

  return (
    <section className="col-b-viewer" aria-label="Column B: Center Live PDF Viewer & Calibration">
      {/* Viewer Toolbar */}
      <ViewerToolbar
        onToggleColA={onToggleColA}
        isColACollapsed={isColACollapsed}
        onToggleColC={onToggleColC}
        isColCCollapsed={isColCCollapsed}
        onToggleColB={onToggleColB}
        onToggleFullScreenCanvas={onToggleFullScreenCanvas}
        isFullScreenCanvas={isFullScreenCanvas}
        showCalibrationTools={showCalibrationTools}
        setShowCalibrationTools={setShowCalibrationTools}
      />

      {/* Precision Micro-Nudge Calibration Subbar */}
      {showCalibrationTools && <CalibrationSubbar />}

      {/* Viewport Canvas Area */}
      <div className="viewer-viewport">
        <VisualPlaygroundCanvas
          pageNumber={activeViewingPage === 3 ? 3 : 1}
          isInteractive={activeViewingPage === 1 || activeViewingPage === 3}
        />
      </div>
    </section>
  );
};

export default StudioPdfViewerPane;
