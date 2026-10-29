/**
 * [Category 1: View]
 * White Caves Real Estate - Right Panel Preferences & Search
 * Theme switch, density toggle, and command palette trigger (< 75 lines).
 */

import React from 'react';
import { useDispatch } from 'react-redux';
import { openCommandPalette, closeRightPanel } from '../../../store/uiCommandSlice';
import useDensity from '../../../hooks/useDensity';
import useTheme from '../../../hooks/useTheme';

const THEME_LABEL = { light: '☀ Light', dark: '☾ Dark', system: '⌥ System' };
const THEME_NEXT = { light: 'dark', dark: 'system', system: 'light' };

export const RightPanelPreferences = () => {
  const dispatch = useDispatch();
  const { density, toggle: toggleDensity } = useDensity();
  const { mode: themeMode, cycle: cycleTheme } = useTheme();

  const handleOpenSearch = () => {
    dispatch(openCommandPalette());
    dispatch(closeRightPanel());
  };

  return (
    <div className="right-panel__section-card">
      <div className="right-panel__section-header">
        <span>Workspace Controls</span>
      </div>

      <div className="right-panel__controls-grid">
        <button
          type="button"
          className="right-panel__pref-btn"
          onClick={cycleTheme}
          title={`Switch theme: ${themeMode} → ${THEME_NEXT[themeMode]}`}
        >
          Theme: {THEME_LABEL[themeMode]}
        </button>
        <button
          type="button"
          className="right-panel__pref-btn"
          onClick={toggleDensity}
          title="Toggle density"
        >
          {density === 'compact' ? '▤ Compact' : '▣ Comfortable'}
        </button>
      </div>

      <button
        type="button"
        className="right-panel__search-btn"
        onClick={handleOpenSearch}
        title="Open Command Palette (Ctrl+K)"
      >
        ⌘ Command Palette (Ctrl+K)
      </button>
    </div>
  );
};

export default React.memo(RightPanelPreferences);
