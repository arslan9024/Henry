/**
 * [Category 1: View]
 * White Caves Real Estate - Right Side Bar Panel (RightSidePanel.jsx)
 * Symmetrical docked operations panel orchestrator (< 70 lines, zero backdrop, zero overlap).
 */

import React, { useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectRightPanelOpen, closeRightPanel } from '../../store/uiCommandSlice';
import RightPanelAiStatus from './rightPanel/RightPanelAiStatus';
import RightPanelTaskJourney from './rightPanel/RightPanelTaskJourney';
import RightPanelVaultQuickAccess from './rightPanel/RightPanelVaultQuickAccess';
import RightPanelRegulatoryMeta from './rightPanel/RightPanelRegulatoryMeta';
import RightPanelPreferences from './rightPanel/RightPanelPreferences';

export const RightSidePanel = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector(selectRightPanelOpen);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') dispatch(closeRightPanel());
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, dispatch]);

  if (!isOpen) return null;

  return (
    <aside
      ref={panelRef}
      role="region"
      aria-label="Henry Operations and Workspace Cockpit"
      className="master-right-panel"
    >
      <div className="right-panel__header">
        <div className="right-panel__header-brand">
          <span className="right-panel__avatar">🤵</span>
          <div>
            <h3 className="right-panel__title">Henry Operations</h3>
            <p className="right-panel__subtitle">AI Assistant &amp; Tasks</p>
          </div>
        </div>

        <button
          type="button"
          className="right-panel__close-btn"
          onClick={() => dispatch(closeRightPanel())}
          aria-label="Close panel"
          title="Close operations panel (Esc)"
        >
          ✕
        </button>
      </div>

      <div className="right-panel__body">
        <RightPanelAiStatus />
        <RightPanelTaskJourney />
        <RightPanelVaultQuickAccess />
        <RightPanelPreferences />
        <RightPanelRegulatoryMeta />
      </div>
    </aside>
  );
};

export default RightSidePanel;
