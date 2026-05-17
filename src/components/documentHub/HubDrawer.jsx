import React from 'react';
import ComplianceChecklistPanel from '../ComplianceChecklistPanel';
import ArchiveHistorySidebar from '../ArchiveHistorySidebar';
import AuditLogPanel from '../AuditLogPanel';

const HubDrawer = ({
  drawerTab,
  drawerTrapRef,
  onCloseDrawer,
  onOpenCompliance,
  onOpenArchive,
  onOpenAudit,
}) => {
  return (
    <div className={`right-drawer ${drawerTab ? 'is-open' : ''}`}>
      <div className="right-drawer__scrim" onClick={onCloseDrawer} aria-hidden={!drawerTab} />
      <aside
        ref={drawerTrapRef}
        className="right-drawer__panel"
        role="dialog"
        aria-modal="true"
        aria-label="Compliance and archive drawer"
        aria-hidden={!drawerTab}
        tabIndex={-1}
      >
        <header className="right-drawer__topbar">
          <div className="right-drawer__tabs" role="tablist">
            <button
              type="button"
              role="tab"
              className={`right-drawer__tab ${drawerTab === 'compliance' ? 'is-active' : ''}`}
              aria-selected={drawerTab === 'compliance'}
              onClick={onOpenCompliance}
            >
              Compliance
            </button>
            <button
              type="button"
              role="tab"
              className={`right-drawer__tab ${drawerTab === 'archive' ? 'is-active' : ''}`}
              aria-selected={drawerTab === 'archive'}
              onClick={onOpenArchive}
            >
              Archive
            </button>
            <button
              type="button"
              role="tab"
              className={`right-drawer__tab ${drawerTab === 'audit' ? 'is-active' : ''}`}
              aria-selected={drawerTab === 'audit'}
              onClick={onOpenAudit}
            >
              Audit
            </button>
          </div>
          <button
            type="button"
            className="right-drawer__close"
            onClick={onCloseDrawer}
            aria-label="Close drawer"
            title="Close (Esc)"
          >
            ✕
          </button>
        </header>
        <div className="right-drawer__body">
          {drawerTab === 'compliance' ? <ComplianceChecklistPanel /> : null}
          {drawerTab === 'archive' ? <ArchiveHistorySidebar /> : null}
          {drawerTab === 'audit' ? <AuditLogPanel /> : null}
        </div>
      </aside>
    </div>
  );
};

export default React.memo(HubDrawer);
