/**
 * useComplianceBadge.js — derives the compliance toolbar badge properties
 * from the live warnings in Redux and provides the handleComplianceCheck callback.
 *
 * Extracting this logic out of DocumentHubPage keeps that component thin and
 * makes the badge logic independently testable.
 */

import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { evaluateCompliance } from '../compliance/ruleEngine';
import { setWarningsForTemplate } from '../store/complianceSlice';
import { addAuditLog } from '../store/auditSlice';
import { pushToast } from '../store/uiSlice';
import { openDrawer } from '../store/uiCommandSlice';
import { selectDocument, selectActiveTemplateWarnings } from '../store/selectors';

/**
 * @returns {{
 *   liveWarnings: object[],
 *   criticalCount: number,
 *   importantCount: number,
 *   totalCount: number,
 *   badgeTone: 'critical' | 'important' | 'clear',
 *   badgeLabel: string,
 *   badgeTitle: string,
 *   handleComplianceCheck: () => void,
 * }}
 */
export const useComplianceBadge = (activeTemplate, policyVersion) => {
  const dispatch = useDispatch();
  const documentData = useSelector(selectDocument);

  // Evaluate compliance warnings (memoized to avoid redundant calls).
  const liveWarnings = useMemo(
    () => evaluateCompliance(activeTemplate, documentData),
    [activeTemplate, documentData],
  );

  // Keep the Redux slice up-to-date so ComplianceChecklistPanel reads from store.
  useEffect(() => {
    dispatch(setWarningsForTemplate({ templateKey: activeTemplate, warnings: liveWarnings }));
  }, [liveWarnings, activeTemplate, dispatch]);

  const criticalCount = useMemo(
    () => liveWarnings.filter((w) => w.severity === 'critical').length,
    [liveWarnings],
  );
  const importantCount = useMemo(
    () => liveWarnings.filter((w) => w.severity === 'important').length,
    [liveWarnings],
  );
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
    dispatch(openDrawer('compliance'));
  }, [activeTemplate, liveWarnings, criticalCount, importantCount, dispatch, policyVersion]);

  return {
    liveWarnings,
    criticalCount,
    importantCount,
    totalCount,
    badgeTone,
    badgeLabel,
    badgeTitle,
    handleComplianceCheck,
  };
};
