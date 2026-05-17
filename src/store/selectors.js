import { createSelector } from '@reduxjs/toolkit';
import { TEMPLATE_MAP } from '../templates/registry';
import { getRequiredFieldsForTemplate } from '../templates/requiredFieldsRegistry';

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

const readValueByPath = (obj, path) => {
  if (!obj || !path) return undefined;
  return String(path)
    .split('.')
    .reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
};

const isMissingRequiredValue = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (typeof value === 'number') return Number.isNaN(value);
  if (typeof value === 'boolean') return false;
  if (Array.isArray(value)) return value.length === 0;
  return false;
};

export const selectRequiredFieldsForActiveTemplate = createSelector(
  [selectActiveTemplate],
  (activeTemplate) => getRequiredFieldsForTemplate(activeTemplate),
);

export const selectBlockingMissingRequiredFields = createSelector(
  [selectDocument, selectRequiredFieldsForActiveTemplate],
  (document, requiredFields) =>
    requiredFields.filter(
      (field) => field.blocking && isMissingRequiredValue(readValueByPath(document, field.path)),
    ),
);

export const selectDocumentReadiness = createSelector(
  [selectBlockingMissingRequiredFields],
  (missingBlockingFields) => ({
    missingBlockingFields,
    isReadyForGeneration: missingBlockingFields.length === 0,
  }),
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

/**
 * selectSectionCompleteness — for each section of the document, compute how
 * many scalar fields are non-empty vs the total declared scalar fields.
 * Returns an object keyed by section name: { filled: number, total: number }.
 * Array fields (additionalTerms, etc.) are excluded (edited via slice actions).
 */
export const selectSectionCompleteness = createSelector([selectDocument], (document) => {
  const result = {};
  for (const [section, fields] of Object.entries(document)) {
    if (typeof fields !== 'object' || fields === null || Array.isArray(fields)) continue;
    const scalars = Object.entries(fields).filter(([, v]) => !Array.isArray(v));
    const total = scalars.length;
    const filled = scalars.filter(([, v]) => {
      if (v === null || v === undefined) return false;
      if (typeof v === 'string') return v.trim() !== '';
      if (typeof v === 'number') return !Number.isNaN(v);
      if (typeof v === 'boolean') return true; // booleans count as filled
      return true;
    }).length;
    result[section] = { filled, total };
  }
  return result;
});
