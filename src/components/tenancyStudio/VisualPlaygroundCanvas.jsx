/**
 * [Category 1: View]
 * White Caves Real Estate - Visual Playground Canvas Orchestrator
 * Clean Single-Purpose Architecture (< 85 lines).
 */

import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { renderPdfPageToCanvas } from '../../services/tenancyStudio/pdfPageRenderer';
import { renderDldBlueprint } from '../../services/tenancyStudio/dldBlueprintRenderer';
import { useStudioCanvasDrag } from '../../hooks/useStudioCanvasDrag';
import { useStudioKeyboardNudge } from '../../hooks/useStudioKeyboardNudge';
import CanvasAlignmentOverlay from './CanvasAlignmentOverlay';
import CanvasFieldChips from './CanvasFieldChips';

export const VisualPlaygroundCanvas = ({ pageNumber = 1, isInteractive = true }) => {
  const canvasRef = useRef(null);
  const zoom = useSelector((state) => state.tenancyStudio.zoom || 1.0);
  const coordinates = useSelector((state) => state.tenancyStudio.coordinates);
  const page1 = useSelector((state) => state.tenancyStudio.page1);
  const page3 = useSelector((state) => state.tenancyStudio.page3);
  const snapToGrid = useSelector((state) => state.tenancyStudio.snapToGrid || false);
  const gridSize = useSelector((state) => state.tenancyStudio.gridSize || 5);
  const showCrosshairs = useSelector((state) => state.tenancyStudio.showCrosshairs !== false);

  const [isPdfLoaded, setIsPdfLoaded] = useState(false);
  const { handleMouseDown, selectedFieldKey } = useStudioCanvasDrag({ activePage: pageNumber, zoom });
  useStudioKeyboardNudge({ activePage: pageNumber, isEnabled: isInteractive });

  useEffect(() => {
    let isCancelled = false;
    if (canvasRef.current) {
      renderPdfPageToCanvas({
        pdfUrl: '/importantFolder/Tenancy%20Contract%20Template.pdf',
        pageNumber,
        canvas: canvasRef.current,
        scale: 2 * zoom,
      }).then((success) => {
        if (!isCancelled) {
          setIsPdfLoaded(success);
          if (!success) renderDldBlueprint(canvasRef.current, pageNumber, 2);
        }
      });
    }
    return () => {
      isCancelled = true;
    };
  }, [pageNumber, zoom]);

  const targetCoords = pageNumber === 1 ? coordinates.page1 || {} : coordinates.page3 || {};
  const targetPayload = pageNumber === 1 ? page1 : page3;
  const selectedCoord = targetCoords[selectedFieldKey] || null;

  const canvasWidth = 595 * zoom;
  const canvasHeight = 842 * zoom;

  return (
    <div
      className="playground-canvas-wrapper"
      style={{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }}
    >
      <canvas
        ref={canvasRef}
        className="playground-canvas-element"
        style={{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }}
      />

      <CanvasAlignmentOverlay
        snapToGrid={snapToGrid}
        gridSize={gridSize}
        zoom={zoom}
        showCrosshairs={showCrosshairs}
        selectedCoord={selectedCoord}
      />

      {isInteractive && (
        <CanvasFieldChips
          targetCoords={targetCoords}
          targetPayload={targetPayload}
          selectedFieldKey={selectedFieldKey}
          zoom={zoom}
          handleMouseDown={handleMouseDown}
        />
      )}

      <div className="playground-canvas-badge">
        {isPdfLoaded ? '✓ Official DLD Template PDF' : '⚡ Vector Blueprint'} · {Math.round(zoom * 100)}%
      </div>
    </div>
  );
};

VisualPlaygroundCanvas.propTypes = {
  pageNumber: PropTypes.number,
  isInteractive: PropTypes.bool,
};

export default VisualPlaygroundCanvas;
