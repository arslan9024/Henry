/**
 * [Category 1: View]
 * White Caves Real Estate - Canvas Grid & Crosshairs Overlay
 * Clean, lightweight SVG overlay for visual alignment (< 65 lines).
 */

import React from 'react';
import PropTypes from 'prop-types';

export const CanvasAlignmentOverlay = ({ snapToGrid, gridSize, zoom, showCrosshairs, selectedCoord }) => {
  const crosshairLeft = selectedCoord ? selectedCoord.x * zoom : 0;
  const crosshairTop = selectedCoord ? (842 - selectedCoord.y - (selectedCoord.size || 8.5)) * zoom : 0;

  return (
    <>
      {/* Snap to Grid Dotted Overlay */}
      {snapToGrid && (
        <div
          className="canvas-grid-overlay"
          style={{
            backgroundSize: `${gridSize * zoom * 2}px ${gridSize * zoom * 2}px`,
          }}
        />
      )}

      {/* Alignment Crosshair Guidelines */}
      {showCrosshairs && selectedCoord && (
        <svg className="canvas-crosshairs-svg">
          <line
            x1="0"
            y1={crosshairTop}
            x2={595 * zoom}
            y2={crosshairTop}
            stroke="#ef4444"
            strokeWidth="1"
            strokeDasharray="4 3"
            opacity="0.85"
          />
          <line
            x1={crosshairLeft}
            y1="0"
            x2={crosshairLeft}
            y2={842 * zoom}
            stroke="#ef4444"
            strokeWidth="1"
            strokeDasharray="4 3"
            opacity="0.85"
          />
        </svg>
      )}
    </>
  );
};

CanvasAlignmentOverlay.propTypes = {
  snapToGrid: PropTypes.bool.isRequired,
  gridSize: PropTypes.number.isRequired,
  zoom: PropTypes.number.isRequired,
  showCrosshairs: PropTypes.bool.isRequired,
  selectedCoord: PropTypes.object,
};

export default CanvasAlignmentOverlay;
