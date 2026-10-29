/**
 * [Category 1: View]
 * White Caves Real Estate - Canvas Draggable Field Chips
 * Renders interactive coordinate markers on top of PDF viewport (< 70 lines).
 */

import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { setSelectedFieldKey } from '../../store/tenancyStudioSlice';

export const CanvasFieldChips = ({
  targetCoords,
  targetPayload,
  selectedFieldKey,
  zoom,
  handleMouseDown,
}) => {
  const dispatch = useDispatch();

  return (
    <>
      {Object.keys(targetCoords).map((fieldKey) => {
        const coord = targetCoords[fieldKey];
        if (!coord) return null;

        const left = coord.x * zoom;
        const top = (842 - coord.y - (coord.size || 8.5)) * zoom;
        const isSelected = selectedFieldKey === fieldKey;
        const displayVal = targetPayload[fieldKey] || coord.label;
        const fontSizePx = Math.max(9, (coord.size || 8.5) * zoom);

        return (
          <div
            key={fieldKey}
            onMouseDown={(e) => handleMouseDown(fieldKey, coord.x, coord.y, e)}
            onClick={() => dispatch(setSelectedFieldKey(fieldKey))}
            title={`${coord.label} (x: ${coord.x}, y: ${coord.y}) - Drag or use Arrow keys to nudge`}
            className={`canvas-field-chip ${isSelected ? 'canvas-field-chip--selected' : ''}`}
            style={{
              left: `${left}px`,
              top: `${top}px`,
              fontSize: `${fontSizePx}px`,
            }}
          >
            {coord.isTickMark ? '✓' : displayVal}
          </div>
        );
      })}
    </>
  );
};

CanvasFieldChips.propTypes = {
  targetCoords: PropTypes.object.isRequired,
  targetPayload: PropTypes.object.isRequired,
  selectedFieldKey: PropTypes.string,
  zoom: PropTypes.number.isRequired,
  handleMouseDown: PropTypes.func.isRequired,
};

export default CanvasFieldChips;
