import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TEMPLATE_MAP } from '../templates/registry';
import ComplianceChecklistPanel from './ComplianceChecklistPanel';
import ArchiveHistorySidebar from './ArchiveHistorySidebar';
import AuditLogPanel from './AuditLogPanel';
import InfoArticlesPanel from './InfoArticlesPanel';
import FooterActionBar from './FooterActionBar';
import ChatDock from './ChatDock';
import PrintPreview from './PrintPreview';
import useFocusTrap from '../hooks/useFocusTrap';
import useBackgroundInert from '../hooks/useBackgroundInert';
import { evaluateCompliance } from '../compliance/ruleEngine';
import { setWarningsForTemplate } from '../store/complianceSlice';
import { addAuditLog } from '../store/auditSlice';
import { pushToast } from '../store/uiSlice';
import { selectDocument, selectCanGeneratePdf, selectActiveTemplateLabel } from '../store/selectors';

const RAIL_KEY = 'henry.ui.leftRail';
const readRail = () => {
  try {
    const v = localStorage.getItem(RAIL_KEY);
    if (v === 'collapsed' || v === 'expanded') return v;
  } catch {
    /* ignore */
  }
  // Default: collapsed on narrower viewports.
  if (typeof window !== 'undefined' && window.innerWidth < 1280) return 'collapsed';
  return 'expanded';
};

const DocumentHubPage = () => {
  const dispatch = useDispatch();
  const activeTemplate = useSelector((state) => state.template.activeTemplate);
  const activeTemplateLabel = useSelector(selectActiveTemplateLabel);
  const documentData = useSelector(selectDocument);
  const canGeneratePdf = useSelector(selectCanGeneratePdf);
  const policyVersion = useSelector((state) => state.policyMeta.version);

  const [previewMode, setPreviewMode] = useState(false);
  const [leftRail, setLeftRail] = useState(readRail);
  const [drawerTab, setDrawerTab] = useState(null); // null | 'compliance' | 'archive' | 'audit'

  // Persist rail state.
  useEffect(() => {
    try {
      localStorage.setItem(RAIL_KEY, leftRail);
    } catch {
      /* ignore */
    }
  }, [leftRail]);

  // Listen for hamburger from TopNavbar (small viewports).
  useEffect(() => {
    const onToggle = () => setLeftRail((s) => (s === 'expanded' ? 'collapsed' : 'expanded'));
    window.addEventListener('henry:toggle-left-rail', onToggle);
    return () => window.removeEventListener('henry:toggle-left-rail', onToggle);
  }, []);

  // T-41 — command palette can open specific drawer tabs via custom events.
  useEffect(() => {
    const onCompliance = () => setDrawerTab('compliance');
    const onArchive = () => setDrawerTab('archive');
    const onAudit = () => setDrawerTab('audit');
    const onPrint = () => {
      // Re-use the existing footer print button via a DOM click if present.
      document.querySelector('.footer-print-btn')?.click();
    };
    window.addEventListener('henry:open-compliance', onCompliance);
    window.addEventListener('henry:open-archive', onArchive);
    window.addEventListener('henry:open-audit', onAudit);
    window.addEventListener('henry:trigger-print', onPrint);
    return () => {
      window.removeEventListener('henry:open-compliance', onCompliance);
      window.removeEventListener('henry:open-archive', onArchive);
      window.removeEventListener('henry:open-audit', onAudit);
      window.removeEventListener('henry:trigger-print', onPrint);
    };
  }, []);

  // Esc closes drawer.
  useEffect(() => {
    if (!drawerTab) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setDrawerTab(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawerTab]);

  const ActiveTemplateComponent = TEMPLATE_MAP[activeTemplate]?.component;

  // Live compliance counts for the toolbar badge.
  const liveWarnings = useMemo(
    () => evaluateCompliance(activeTemplate, documentData),
    [activeTemplate, documentData],
  );
  const criticalCount = liveWarnings.filter((w) => w.severity === 'critical').length;
  const importantCount = liveWarnings.filter((w) => w.severity === 'important').length;
  const totalCount = liveWarnings.length;

  const badgeTone = criticalCount > 0 ? 'critical' : importantCount > 0 ? 'important' : 'clear';
  const badgeLabel =
    criticalCount > 0
      ? `${criticalCount} critical`
      : importantCount > 0
        ? `${importantCount} to review`
        : 'All clear';
  const badgeTitle =
    totalCount === 0
      ? 'No outstanding compliance warnings — click to view checklist.'
      : `${criticalCount} critical, ${importantCount} important — click for details.`;

  const handleComplianceCheck = useCallback(() => {
    dispatch(setWarningsForTemplate({ templateKey: activeTemplate, warnings: liveWarnings }));
    dispatch(
      addAuditLog({
        type: 'COMPLIANCE_CHECK_RUN',
        template: activeTemplate,
        policyVersion,
        timestamp: new Date().toISOString(),
        warningCount: liveWarnings.length,
        criticalCount,
      }),
    );
    dispatch(
      pushToast({
        tone: criticalCount > 0 ? 'error' : importantCount > 0 ? 'warning' : 'success',
        title:
          criticalCount > 0
            ? `${criticalCount} critical issue${criticalCount === 1 ? '' : 's'}`
            : importantCount > 0
              ? `${importantCount} item${importantCount === 1 ? '' : 's'} to review`
              : 'Compliance clear',
        body:
          liveWarnings.length === 0
            ? 'All RERA / DLD checks pass for this document.'
            : 'Drawer opened with full checklist.',
      }),
    );
    setDrawerTab('compliance');
  }, [activeTemplate, liveWarnings, criticalCount, importantCount, dispatch, policyVersion]);

  const openCompliance = useCallback(() => setDrawerTab('compliance'), []);
  const openArchive = useCallback(() => setDrawerTab('archive'), []);
  const openAudit = useCallback(() => setDrawerTab('audit'), []);
  const closeDrawer = useCallback(() => setDrawerTab(null), []);
  const toggleRail = useCallback(() => setLeftRail((s) => (s === 'expanded' ? 'collapsed' : 'expanded')), []);

  const railCollapsed = leftRail === 'collapsed';
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
              onClick={() => {
                setLeftRail('expanded');
              }}
              aria-label="Templates"
              title="Templates"
            >
              📄
            </button>
            <button
              type="button"
              className="icon-rail__btn"
              onClick={() => {
                setLeftRail('expanded');
              }}
              aria-label="Highlights"
              title="Highlights"
            >
              💡
            </button>
            <button
              type="button"
              className="icon-rail__btn"
              onClick={() => {
                setLeftRail('expanded');
              }}
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
          {previewMode ? (
            <PrintPreview />
          ) : ActiveTemplateComponent ? (
            <ActiveTemplateComponent />
          ) : (
            <p>No template selected.</p>
          )}
        </section>
      </section>

      {/* Mobile quick actions (Phase 4 step 3): faster access to rail + drawer tabs on phones */}
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
