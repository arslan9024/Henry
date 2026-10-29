/**
 * [Category 1: View]
 * White Caves Real Estate - Right Panel AI Status & Identity Card
 * Clean single-purpose component (< 75 lines).
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { selectHenry } from '../../../store/selectors';

export const RightPanelAiStatus = () => {
  const henry = useSelector(selectHenry);

  return (
    <div className="right-panel__ai-card">
      <div className="right-panel__ai-header">
        <span className="right-panel__ai-name">{henry.name}</span>
        <span className="right-panel__ai-pill">
          <span className="right-panel__status-dot" />
          {henry.status || 'Ready & Verified'}
        </span>
      </div>

      <div className="right-panel__ai-title">{henry.title}</div>
      <div className="right-panel__ai-sub">
        Module: <strong>{henry.module}</strong> · AI ID: <code>{henry.aiId}</code>
      </div>
      <div className="right-panel__ai-sync">
        Last Sync:{' '}
        {henry.lastSyncedAt
          ? henry.lastSyncedAt.replace('T', ' ').replace('Z', ' UTC')
          : 'Local Standalone Mode'}
      </div>
    </div>
  );
};

export default React.memo(RightPanelAiStatus);
