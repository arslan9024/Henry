/**
 * [Category 1: View]
 * White Caves Real Estate - Unified Master Top Navbar (TopNavbar.jsx)
 * Unfrozen, ultra-slim, prominent navigation across core modules (< 75 lines).
 */

import React, { useState } from 'react';
import TopNavbarBrand from './navbar/TopNavbarBrand';
import TopNavbarModuleTabs from './navbar/TopNavbarModuleTabs';
import HenryIdentityWidget from './navbar/HenryIdentityWidget';
import TopNavbarQuickNav from './navbar/TopNavbarQuickNav';
import TopNavbarPreferences from './navbar/TopNavbarPreferences';
import AutosaveIndicator from './AutosaveIndicator';

const TopNavbar = React.memo(() => {
  const [navBarCollapsed, setNavBarCollapsed] = useState(false);

  return (
    <header
      className={`top-navbar print-hidden ${navBarCollapsed ? 'is-collapsed' : ''}`}
      role="banner"
      aria-label="Main navigation"
      data-overlay-shield
    >
      {/* ── Left: Brand & Sidebar Toggle ───────────────────────────────── */}
      <TopNavbarBrand />

      {/* ── Center: Prominent Luxury Module Navigation Tabs ────────────── */}
      <TopNavbarModuleTabs />

      {/* ── Right: AI Assistant, Save Status & Workspace Controls ──────── */}
      <div className="top-navbar__actions" aria-label="Document actions">
        <div className="top-navbar__status-slot" aria-label="Workspace save status">
          <AutosaveIndicator />
        </div>
        <HenryIdentityWidget />
        <div className="top-navbar__action-grid">
          <TopNavbarQuickNav />
          <TopNavbarPreferences
            navBarCollapsed={navBarCollapsed}
            onToggleCollapse={() => setNavBarCollapsed((v) => !v)}
          />
        </div>
      </div>
    </header>
  );
});

TopNavbar.displayName = 'TopNavbar';

export default TopNavbar;
