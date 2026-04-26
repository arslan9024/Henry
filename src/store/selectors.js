import { createSelector } from '@reduxjs/toolkit';
import { TEMPLATE_MAP } from '../templates/registry';

export const selectActiveTemplate = (state) => state.template.activeTemplate;
export const selectDocument = (state) => state.document;
export const selectPolicyMeta = (state) => state.policyMeta;
export const selectSidebarState = (state) => state.sidebar;
export const selectComplianceState = (state) => state.compliance;
export const selectHenry = (state) => state.henry;
export const selectArchiveState = (state) => state.archive;
export const selectOcrState = (state) => state.ocr;

export const selectActiveTemplateMeta = createSelector([selectActiveTemplate], (activeTemplate) => {
  return TEMPLATE_MAP[activeTemplate] || { key: activeTemplate, label: activeTemplate };
});

export const selectActiveTemplateLabel = createSelector(
  [selectActiveTemplateMeta],
  (templateMeta) => templateMeta.label,
);

export const selectCanGeneratePdf = createSelector([selectActiveTemplateMeta], (templateMeta) =>
  Boolean(templateMeta.supportsPdf),
);

export const selectSidebarContent = createSelector(
  [selectSidebarState, selectActiveTemplate],
  (sidebarState, activeTemplate) => {
    const common = sidebarState.guidance?.common || { highlights: [], articles: [] };
    const specific = sidebarState.guidance?.byTemplate?.[activeTemplate] || {
      highlights: [],
      articles: [],
    };

    return {
      highlights: [...common.highlights, ...specific.highlights],
      articles: [...common.articles, ...specific.articles],
    };
  },
);

export const selectActiveTemplateWarnings = createSelector(
  [selectComplianceState, selectActiveTemplate],
  (complianceState, activeTemplate) => complianceState.warningsByTemplate[activeTemplate] || [],
);

export const selectComplianceSummary = createSelector([selectActiveTemplateWarnings], (warnings) => {
  return warnings.reduce(
    (acc, warning) => {
      if (warning.severity === 'critical') acc.critical += 1;
      else if (warning.severity === 'important') acc.important += 1;
      else acc.info += 1;
      return acc;
    },
    { critical: 0, important: 0, info: 0 },
  );
});

export const selectArchiveEntries = createSelector(
  [selectArchiveState],
  (archiveState) => archiveState.entries || [],
);

export const selectArchiveEntriesForCurrentUnit = createSelector(
  [selectArchiveEntries, selectDocument],
  (entries, document) => {
    const unit = document.property?.unit;
    const community = document.property?.community;
    return entries.filter((entry) => entry.unit === unit && entry.community === community);
  },
);

export const selectLatestApprovedOcr = createSelector([selectOcrState], (ocrState) => ocrState.lastApproved);
