/**
 * [Category 1: View]
 * White Caves Real Estate - Studio Viewer Toolbar
 * Page selector, zoom selector, calibrate toggle, and Column A/C & Fullscreen layout toggles (< 85 lines, 0 inline CSS).
 */

import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveViewingPage, setZoom } from '../../store/tenancyStudioSlice';
import { STUDIO_PREVIEW_PAGES } from '../../config/tenancyOptionsConfig';

const ZOOM_LEVELS = [
  { val: 0.75, label: '75%' },
  { val: 0.85, label: '85%' },
  { val: 1.0, label: '100%' },
  { val: 1.15, label: '115%' },
  { val: 1.3, label: '130%' },
];

export const ViewerToolbar = ({
  onToggleColA,
  isColACollapsed,
  onToggleColC,
  isColCCollapsed,
  onToggleColB,
  onToggleFullScreenCanvas,
  isFullScreenCanvas,
  showCalibrationTools,
  setShowCalibrationTools,
}) => {
  const dispatch = useDispatch();
  const activeViewingPage = useSelector((state) => state.tenancyStudio.activeViewingPage);
  const zoom = useSelector((state) => state.tenancyStudio.zoom || 1.0);

  return (
    <div className="viewer-toolbar">
      <div className="viewer-toolbar-left">
        <button
          type="button"
          className={`viewer-btn ${isColACollapsed ? 'active' : ''}`}
          onClick={onToggleColA}
          title={isColACollapsed ? 'Show Column A Inputs' : 'Collapse Column A Inputs'}
        >
          {isColACollapsed ? '▶ Inputs' : '◀ Inputs'}
        </button>

        <select
          className="viewer-select"
          value={activeViewingPage}
          onChange={(e) => dispatch(setActiveViewingPage(parseInt(e.target.value, 10)))}
          aria-label="Viewer Page"
        >
          {STUDIO_PREVIEW_PAGES.map((p) => (
            <option key={p.num} value={p.num}>
              {p.label}
            </option>
          ))}
        </select>

        <select
          className="viewer-select"
          value={zoom}
          onChange={(e) => dispatch(setZoom(parseFloat(e.target.value)))}
          aria-label="Zoom Level"
        >
          {ZOOM_LEVELS.map((z) => (
            <option key={z.val} value={z.val}>
              {z.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          className={`viewer-btn ${showCalibrationTools ? 'active' : ''}`}
          onClick={() => setShowCalibrationTools(!showCalibrationTools)}
          title="Toggle precision coordinate micro-nudge tools"
        >
          📐 Calibrate {showCalibrationTools ? '▴' : '▾'}
        </button>
      </div>

      <div className="viewer-toolbar-right">
        {onToggleColB && (
          <button
            type="button"
            className="viewer-btn"
            onClick={onToggleColB}
            title="Minimize Preview Pane (Collapse Column B)"
          >
            Hide Preview ▾
          </button>
        )}
        <button
          type="button"
          className={`viewer-btn viewer-btn--bold ${isFullScreenCanvas ? 'active' : ''}`}
          onClick={onToggleFullScreenCanvas}
          title={isFullScreenCanvas ? 'Exit Full Screen Canvas' : 'Maximize Canvas (Collapse Col A & C)'}
        >
          {isFullScreenCanvas ? '⤢ Standard View' : '⛶ Full Canvas'}
        </button>

        <button
          type="button"
          className={`viewer-btn ${isColCCollapsed ? 'active' : ''}`}
          onClick={onToggleColC}
          title={isColCCollapsed ? 'Show Column C Status Sidebar' : 'Collapse Column C Status Sidebar'}
        >
          {isColCCollapsed ? 'Status ◀' : 'Status ▶'}
        </button>
      </div>
    </div>
  );
};

ViewerToolbar.propTypes = {
  onToggleColA: PropTypes.func.isRequired,
  isColACollapsed: PropTypes.bool,
  onToggleColC: PropTypes.func.isRequired,
  isColCCollapsed: PropTypes.bool,
  onToggleColB: PropTypes.func,
  onToggleFullScreenCanvas: PropTypes.func.isRequired,
  isFullScreenCanvas: PropTypes.bool,
  showCalibrationTools: PropTypes.bool.isRequired,
  setShowCalibrationTools: PropTypes.func.isRequired,
};

export default ViewerToolbar;
