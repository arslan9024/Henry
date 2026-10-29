/**
 * [Category 1: View]
 * White Caves Real Estate - Top Navbar User Preferences
 * Theme switch, density toggle, Right Panel toggle, and slim navbar toggle (< 75 lines).
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleRightPanel, selectRightPanelOpen } from '../../store/uiCommandSlice';
import useDensity from '../../hooks/useDensity';
import useTheme from '../../hooks/useTheme';

const THEME_LABEL = { light: '☀ Light', dark: '☾ Dark', system: '⌥ System' };
const THEME_NEXT = { light: 'dark', dark: 'system', system: 'light' };

export const TopNavbarPreferences = ({ navBarCollapsed, onToggleCollapse }) => {
  const dispatch = useDispatch();
  const isRightPanelOpen = useSelector(selectRightPanelOpen);
  const { density, toggle: toggleDensity } = useDensity();
  const { mode: themeMode, cycle: cycleTheme } = useTheme();

  return (
    <div className="top-navbar__preferences" role="group" aria-label="Workspace preferences">
      <button
        type="button"
        className="density-toggle"
        onClick={cycleTheme}
        title={`Theme: ${themeMode} → ${THEME_NEXT[themeMode]}`}
      >
        {THEME_LABEL[themeMode]}
      </button>

      <button
        type="button"
        className="density-toggle"
        onClick={toggleDensity}
        title={density === 'compact' ? 'Switch to comfortable density' : 'Switch to compact density'}
      >
        {density === 'compact' ? '▤ Compact' : '▣ Comfortable'}
      </button>

      <button
        type="button"
        className={`density-toggle top-navbar__ops-toggle ${isRightPanelOpen ? 'is-active' : ''}`}
        onClick={() => dispatch(toggleRightPanel())}
        aria-label="Toggle Operations Side Panel"
        title="Toggle Henry Operations Side Panel"
      >
        ⚡ Operations
      </button>

      <button
        type="button"
        className="density-toggle top-navbar__collapse-toggle"
        onClick={onToggleCollapse}
        title={navBarCollapsed ? 'Expand top navigation bar' : 'Minimize top navigation bar'}
      >
        {navBarCollapsed ? '▼' : '▲'}
      </button>
    </div>
  );
};

export default React.memo(TopNavbarPreferences);
