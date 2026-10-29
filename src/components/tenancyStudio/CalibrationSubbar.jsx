/**
 * [Category 1: View]
 * White Caves Real Estate - Studio Calibration Sub-bar
 * Coordinate micro-nudge pad, history undo/redo, grid snap & crosshair guides (< 95 lines, 0 inline CSS).
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  nudgeFieldCoordinate,
  resetCoordinatesToDefault,
  undoCoordinateChange,
  redoCoordinateChange,
  toggleSnapToGrid,
  toggleCrosshairs,
} from '../../store/tenancyStudioSlice';

export const CalibrationSubbar = () => {
  const dispatch = useDispatch();
  const activeViewingPage = useSelector((state) => state.tenancyStudio.activeViewingPage);
  const selectedFieldKey = useSelector((state) => state.tenancyStudio.selectedFieldKey);
  const coordinates = useSelector((state) => state.tenancyStudio.coordinates);
  const snapToGrid = useSelector((state) => state.tenancyStudio.snapToGrid || false);
  const showCrosshairs = useSelector((state) => state.tenancyStudio.showCrosshairs !== false);
  const history = useSelector((state) => state.tenancyStudio.history || { past: [], future: [] });

  const targetCoords = activeViewingPage === 1 ? coordinates.page1 || {} : coordinates.page3 || {};
  const selectedCoord = targetCoords[selectedFieldKey] || null;

  const handleNudge = (dx, dy) => {
    if (!selectedFieldKey) return;
    dispatch(nudgeFieldCoordinate({ page: activeViewingPage, fieldKey: selectedFieldKey, dx, dy }));
  };

  return (
    <div className="calibration-subbar">
      <div>
        {selectedCoord ? (
          <span>
            🎯 <strong>{selectedCoord.label || selectedFieldKey}</strong>: x={selectedCoord.x}, y=
            {selectedCoord.y}
          </span>
        ) : (
          <span>Click any field chip on canvas to select</span>
        )}
      </div>

      <div className="nudge-btn-group">
        <button type="button" className="nudge-btn" onClick={() => handleNudge(-1, 0)} title="Nudge Left 1pt">
          ◀
        </button>
        <button type="button" className="nudge-btn" onClick={() => handleNudge(0, 1)} title="Nudge Up 1pt">
          ▲
        </button>
        <button type="button" className="nudge-btn" onClick={() => handleNudge(0, -1)} title="Nudge Down 1pt">
          ▼
        </button>
        <button type="button" className="nudge-btn" onClick={() => handleNudge(1, 0)} title="Nudge Right 1pt">
          ▶
        </button>

        <button
          type="button"
          className={`nudge-btn ${history.past.length === 0 ? 'nudge-btn--dimmed' : ''}`}
          onClick={() => dispatch(undoCoordinateChange())}
          disabled={history.past.length === 0}
          title="Undo (Ctrl+Z)"
        >
          ↶
        </button>
        <button
          type="button"
          className={`nudge-btn ${history.future.length === 0 ? 'nudge-btn--dimmed' : ''}`}
          onClick={() => dispatch(redoCoordinateChange())}
          disabled={history.future.length === 0}
          title="Redo (Ctrl+Y)"
        >
          ↷
        </button>

        <button
          type="button"
          className={`nudge-btn ${snapToGrid ? 'active' : ''}`}
          onClick={() => dispatch(toggleSnapToGrid())}
          title="5pt Snap to grid"
        >
          ⌗ Grid
        </button>
        <button
          type="button"
          className={`nudge-btn ${showCrosshairs ? 'active' : ''}`}
          onClick={() => dispatch(toggleCrosshairs())}
          title="Toggle crosshair guides"
        >
          ✛ Guides
        </button>

        <button
          type="button"
          className="nudge-btn nudge-btn--danger"
          onClick={() => {
            if (window.confirm('Reset coordinates to official DLD defaults?')) {
              dispatch(resetCoordinatesToDefault());
            }
          }}
        >
          ↺ Reset
        </button>
      </div>
    </div>
  );
};

export default CalibrationSubbar;
