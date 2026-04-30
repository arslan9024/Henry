import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TEMPLATE_MAP } from '../templates/registry';
import ComplianceChecklistPanel from './ComplianceChecklistPanel';
import ArchiveHistorySidebar from './ArchiveHistorySidebar';
import AuditLogPanel from './AuditLogPanel';
import InfoArticlesPanel from './InfoArticlesPanel';
import FooterActionBar from './FooterActionBar';
import ChatDock from './ChatDock';
import PrintPreview from './PrintPreview';
import DocumentWorkAreaForm from './DocumentWorkAreaForm';
import useFocusTrap from '../hooks/useFocusTrap';
import useBackgroundInert from '../hooks/useBackgroundInert';
import { useDrawer } from '../hooks/useDrawer';
import { useComplianceBadge } from '../hooks/useComplianceBadge';
import { selectCanGeneratePdf, selectActiveTemplateLabel } from '../store/selectors';
import {
  toggleLeftRail as toggleLeftRailAction,
  setLeftRail as setLeftRailAction,
  selectLeftRail,
  selectPrintTrigger,
} from '../store/uiCommandSlice';

const DocumentHubPage = () => {
  const dispatch = useDispatch();
  const activeTemplate = useSelector((state) => state.template.activeTemplate);
  const activeTemplateLabel = useSelector(selectActiveTemplateLabel);
  const canGeneratePdf = useSelector(selectCanGeneratePdf);
  const policyVersion = useSelector((state) => state.policyMeta.version);
  const leftRail = useSelector(selectLeftRail);
  const printTrigger = useSelector(selectPrintTrigger);

  const [previewMode, setPreviewMode] = useState(false);

  // Watch printTrigger to fire the print dialog.
  const prevPrintTrigger = useRef(printTrigger);
  useEffect(() => {
    if (printTrigger !== prevPrintTrigger.current) {
      prevPrintTrigger.current = printTrigger;
      document.querySelector('.footer-print-btn')?.click();
    }
  }, [printTrigger]);

  const { drawerTab, openCompliance, openArchive, openAudit, closeDrawer } = useDrawer();
  const { badgeTone, badgeLabel, badgeTitle, handleComplianceCheck } = useComplianceBadge(
    activeTemplate,
    policyVersion,
  );

  const ActiveTemplateComponent = TEMPLATE_MAP[activeTemplate]?.component;
  const railCollapsed = leftRail === 'collapsed';
  const toggleRail = () => dispatch(toggleLeftRailAction());
  const drawerTrapRef = useFocusTrap(Boolean(drawerTab));
  useBackgroundInert(Boolean(drawerTab));

  return (
    <main className="app-layout" id="main" tabIndex={-1}>
      <section
        className={`hub-content hub-content--right-overlay ${railCollapsed ? 'hub-content--rail-collapsed' : ''}`}
        data-overlay-shield
      >
        {railCollapsed ? (
          <nav className="icon-rail print-hidden" aria-label="Quick rail">
            <button
              type="button"
              className="icon-rail__btn"
              onClick={toggleRail}
              aria-label="Expand sidebar"
              title="Expand sidebar"
            >
              ☰
            </button>
            <span className="icon-rail__divider" />
            <button
              type="button"
              className="icon-rail__btn"
              onClick={() => dispatch(setLeftRailAction('expanded'))}
              aria-label="Templates"
              title="Templates"
            >
              📄
            </button>
            <button
              type="button"
              className="icon-rail__btn"
              onClick={() => dispatch(setLeftRailAction('expanded'))}
              aria-label="Highlights"
              title="Highlights"
            >
              💡
            </button>
            <button
              type="button"
              className="icon-rail__btn"
              onClick={() => dispatch(setLeftRailAction('expanded'))}
              aria-label="Articles"
              title="Articles"
            >
              📚
            </button>
            <span className="icon-rail__divider" />
            <button
              type="button"
              className={`icon-rail__btn ${drawerTab === 'compliance' ? 'is-active' : ''}`}
              onClick={openCompliance}
              aria-label="Compliance checklist"
              title="Compliance checklist"
            >
              ✅
            </button>
            <button
              type="button"
              className={`icon-rail__btn ${drawerTab === 'archive' ? 'is-active' : ''}`}
              onClick={openArchive}
              aria-label="Archive history"
              title="Archive history"
            >
              🗂
            </button>
            <button
              type="button"
              className={`icon-rail__btn ${drawerTab === 'audit' ? 'is-active' : ''}`}
              onClick={openAudit}
              aria-label="Audit log"
              title="Audit log"
            >
              📜
            </button>
          </nav>
        ) : (
          <div style={{ gridArea: 'left', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              type="button"
              className="panel-link-btn"
              onClick={toggleRail}
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              ◂ Collapse sidebar
            </button>
            <InfoArticlesPanel />
          </div>
        )}

        <section className="preview-area" aria-live="polite">
          <DocumentWorkAreaForm />
          {previewMode ? (
            <PrintPreview />
          ) : ActiveTemplateComponent ? (
            <ActiveTemplateComponent />
          ) : (
            <p>No template selected.</p>
          )}
        </section>
      </section>

      {/* Mobile quick actions: faster access to rail + drawer tabs on phones */}
      <nav className="mobile-quick-nav print-hidden" aria-label="Mobile drawer navigation">
        <button
          type="button"
          className={`mobile-quick-nav__btn ${!railCollapsed ? 'is-active' : ''}`}
          onClick={toggleRail}
          aria-label={railCollapsed ? 'Open left rail' : 'Collapse left rail'}
          title={railCollapsed ? 'Open left rail' : 'Collapse left rail'}
        >
          ☰ Menu
        </button>
        <button
          type="button"
          className={`mobile-quick-nav__btn ${drawerTab === 'compliance' ? 'is-active' : ''}`}
          onClick={openCompliance}
          aria-label="Open compliance drawer"
          title="Open compliance drawer"
        >
          ✅ Compliance
        </button>
        <button
          type="button"
          className={`mobile-quick-nav__btn ${drawerTab === 'archive' ? 'is-active' : ''}`}
          onClick={openArchive}
          aria-label="Open archive drawer"
          title="Open archive drawer"
        >
          🗂 Archive
        </button>
        <button
          type="button"
          className={`mobile-quick-nav__btn ${drawerTab === 'audit' ? 'is-active' : ''}`}
          onClick={openAudit}
          aria-label="Open audit drawer"
          title="Open audit drawer"
        >
          📜 Audit
        </button>
      </nav>

      <div data-overlay-shield>
        <FooterActionBar
          activeTemplateLabel={activeTemplateLabel}
          previewMode={previewMode}
          canGeneratePdf={canGeneratePdf}
          onTogglePreview={() => setPreviewMode((v) => !v)}
          onOpenCompliance={openCompliance}
          onRunComplianceCheck={handleComplianceCheck}
          onOpenArchive={openArchive}
          onOpenAudit={openAudit}
          badgeTone={badgeTone}
          badgeLabel={badgeLabel}
          badgeTitle={badgeTitle}
        />
      </div>

      {/* Right-edge drawer for compliance / archive */}
      <div className={`right-drawer ${drawerTab ? 'is-open' : ''}`}>
        <div className="right-drawer__scrim" onClick={closeDrawer} aria-hidden={!drawerTab} />
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
                onClick={openCompliance}
              >
                Compliance
              </button>
              <button
                type="button"
                role="tab"
                className={`right-drawer__tab ${drawerTab === 'archive' ? 'is-active' : ''}`}
                aria-selected={drawerTab === 'archive'}
                onClick={openArchive}
              >
                Archive
              </button>
              <button
                type="button"
                role="tab"
                className={`right-drawer__tab ${drawerTab === 'audit' ? 'is-active' : ''}`}
                aria-selected={drawerTab === 'audit'}
                onClick={openAudit}
              >
                Audit
              </button>
            </div>
            <button
              type="button"
              className="right-drawer__close"
              onClick={closeDrawer}
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

      {/* Floating Ask-Henry chat */}
      <ChatDock />
    </main>
  );
};

export default React.memo(DocumentHubPage);
