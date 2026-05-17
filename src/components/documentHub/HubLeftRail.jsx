import React from 'react';
import InfoArticlesPanel from '../InfoArticlesPanel';

const HubLeftRail = ({
  railCollapsed,
  drawerTab,
  onToggleRail,
  onOpenCompliance,
  onOpenArchive,
  onOpenAudit,
}) => {
  if (railCollapsed) {
    return (
      <nav className="icon-rail print-hidden" aria-label="Quick rail">
        <button
          type="button"
          className="icon-rail__btn"
          onClick={onToggleRail}
          aria-label="Expand sidebar"
          title="Expand sidebar"
        >
          ☰
        </button>
        <span className="icon-rail__divider" />
        <button
          type="button"
          className="icon-rail__btn"
          onClick={onToggleRail}
          aria-label="Expand sidebar to view templates"
          title="Expand sidebar to view templates"
        >
          📄
        </button>
        <button
          type="button"
          className="icon-rail__btn"
          onClick={onToggleRail}
          aria-label="Expand sidebar to view highlights"
          title="Expand sidebar to view highlights"
        >
          💡
        </button>
        <button
          type="button"
          className="icon-rail__btn"
          onClick={onToggleRail}
          aria-label="Expand sidebar to view articles"
          title="Expand sidebar to view articles"
        >
          📚
        </button>
        <span className="icon-rail__divider" />
        <button
          type="button"
          className={`icon-rail__btn ${drawerTab === 'compliance' ? 'is-active' : ''}`}
          onClick={onOpenCompliance}
          aria-label="Compliance checklist"
          title="Compliance checklist"
        >
          ✅
        </button>
        <button
          type="button"
          className={`icon-rail__btn ${drawerTab === 'archive' ? 'is-active' : ''}`}
          onClick={onOpenArchive}
          aria-label="Archive history"
          title="Archive history"
        >
          🗂
        </button>
        <button
          type="button"
          className={`icon-rail__btn ${drawerTab === 'audit' ? 'is-active' : ''}`}
          onClick={onOpenAudit}
          aria-label="Audit log"
          title="Audit log"
        >
          📜
        </button>
      </nav>
    );
  }

  return (
    <div style={{ gridArea: 'left', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <button
        type="button"
        className="panel-link-btn"
        onClick={onToggleRail}
        title="Collapse sidebar"
        aria-label="Collapse sidebar"
      >
        ◂ Collapse sidebar
      </button>
      <InfoArticlesPanel />
    </div>
  );
};

export default React.memo(HubLeftRail);
