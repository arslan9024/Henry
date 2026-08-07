import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TEMPLATE_MAP } from '../templates/registry';
import FooterActionBar from './FooterActionBar';
import ChatDock from './ChatDock';
import PrintPreviewModal from './PrintPreviewModal';
import DocumentChecklistPanel from './DocumentChecklistPanel';
import useFocusTrap from '../hooks/useFocusTrap';
import useBackgroundInert from '../hooks/useBackgroundInert';
import { selectActiveTemplateLabel, selectCanGeneratePdf } from '../store/selectors';
import { useComplianceBadge } from '../hooks/useComplianceBadge';
import { useDrawer } from '../hooks/useDrawer';
import {
  closePreview,
  openPreview,
  selectLeftRail,
  selectPreviewMode,
  toggleLeftRail,
} from '../store/uiCommandSlice';
import HubLeftRail from './documentHub/HubLeftRail';
import HubWorkspace from './documentHub/HubWorkspace';
import HubMobileQuickNav from './documentHub/HubMobileQuickNav';
import HubDrawer from './documentHub/HubDrawer';

const DocumentHubPage = ({ useInternalNavigation = true }) => {
  const dispatch = useDispatch();
  const activeTemplate = useSelector((state) => state.template.activeTemplate);
  const activeTemplateLabel = useSelector(selectActiveTemplateLabel);
  const canGeneratePdf = useSelector(selectCanGeneratePdf);
  const policyVersion = useSelector((state) => state.policyMeta.version);
  const leftRail = useSelector(selectLeftRail);
  const previewModalOpen = useSelector(selectPreviewMode);
  const { badgeTone, badgeLabel, badgeTitle, handleComplianceCheck } = useComplianceBadge(
    activeTemplate,
    policyVersion,
  );
  const { drawerTab, openCompliance, openArchive, openAudit, closeDrawer } = useDrawer();

  const ActiveTemplateComponent = TEMPLATE_MAP[activeTemplate]?.component;
  const railCollapsed = leftRail === 'collapsed';
  const drawerTrapRef = useFocusTrap(Boolean(drawerTab));

  useBackgroundInert(Boolean(drawerTab) || previewModalOpen);

  const toggleRail = useCallback(() => dispatch(toggleLeftRail()), [dispatch]);
  const openPreviewModal = useCallback(() => dispatch(openPreview()), [dispatch]);
  const closePreviewModal = useCallback(() => dispatch(closePreview()), [dispatch]);

  return (
    <main className="app-layout workflow-page shell-page" id="main" tabIndex={-1}>
      <HubWorkspace
        activeTemplateLabel={activeTemplateLabel}
        canGeneratePdf={canGeneratePdf}
        badgeLabel={badgeLabel}
        badgeTone={badgeTone}
        badgeTitle={badgeTitle}
        policyVersion={policyVersion}
        ActiveTemplateComponent={ActiveTemplateComponent}
        railCollapsed={railCollapsed}
        onOpenCompliance={openCompliance}
        leftRailSlot={
          useInternalNavigation ? (
            <HubLeftRail
              railCollapsed={railCollapsed}
              drawerTab={drawerTab}
              onToggleRail={toggleRail}
              onOpenCompliance={openCompliance}
              onOpenArchive={openArchive}
              onOpenAudit={openAudit}
            />
          ) : null
        }
        rightPanelSlot={
          <aside
            className="right-panel workflow-page__rail print-hidden"
            aria-label="Document checklist and tools"
          >
            <DocumentChecklistPanel />
          </aside>
        }
      />

      {useInternalNavigation ? (
        <HubMobileQuickNav
          railCollapsed={railCollapsed}
          drawerTab={drawerTab}
          onToggleRail={toggleRail}
          onOpenCompliance={openCompliance}
          onOpenArchive={openArchive}
          onOpenAudit={openAudit}
        />
      ) : null}

      <div data-overlay-shield>
        <FooterActionBar
          activeTemplateLabel={activeTemplateLabel}
          canGeneratePdf={canGeneratePdf}
          onOpenPreviewModal={openPreviewModal}
          onOpenCompliance={openCompliance}
          onRunComplianceCheck={handleComplianceCheck}
          onOpenArchive={openArchive}
          onOpenAudit={openAudit}
          badgeTone={badgeTone}
          badgeLabel={badgeLabel}
          badgeTitle={badgeTitle}
        />
      </div>

      <HubDrawer
        drawerTab={drawerTab}
        drawerTrapRef={drawerTrapRef}
        onCloseDrawer={closeDrawer}
        onOpenCompliance={openCompliance}
        onOpenArchive={openArchive}
        onOpenAudit={openAudit}
      />

      <ChatDock />
      <PrintPreviewModal isOpen={previewModalOpen} onClose={closePreviewModal} />
    </main>
  );
};

export default React.memo(DocumentHubPage);
