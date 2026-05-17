import React from 'react';

const HubMobileQuickNav = ({
  railCollapsed,
  drawerTab,
  onToggleRail,
  onOpenCompliance,
  onOpenArchive,
  onOpenAudit,
}) => {
  return (
    <nav className="mobile-quick-nav print-hidden" aria-label="Mobile drawer navigation">
      <button
        type="button"
        className={`mobile-quick-nav__btn ${!railCollapsed ? 'is-active' : ''}`}
        onClick={onToggleRail}
        aria-label={railCollapsed ? 'Open left rail' : 'Collapse left rail'}
        title={railCollapsed ? 'Open left rail' : 'Collapse left rail'}
      >
        ☰ Menu
      </button>
      <button
        type="button"
        className={`mobile-quick-nav__btn ${drawerTab === 'compliance' ? 'is-active' : ''}`}
        onClick={onOpenCompliance}
        aria-label="Open compliance drawer"
        title="Open compliance drawer"
      >
        ✅ Compliance
      </button>
      <button
        type="button"
        className={`mobile-quick-nav__btn ${drawerTab === 'archive' ? 'is-active' : ''}`}
        onClick={onOpenArchive}
        aria-label="Open archive drawer"
        title="Open archive drawer"
      >
        🗂 Archive
      </button>
      <button
        type="button"
        className={`mobile-quick-nav__btn ${drawerTab === 'audit' ? 'is-active' : ''}`}
        onClick={onOpenAudit}
        aria-label="Open audit drawer"
        title="Open audit drawer"
      >
        📜 Audit
      </button>
    </nav>
  );
};

export default React.memo(HubMobileQuickNav);
