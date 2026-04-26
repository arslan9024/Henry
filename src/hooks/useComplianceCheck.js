import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  selectActiveTemplate,
  selectActiveTemplateWarnings,
  selectComplianceSummary,
} from '../store/selectors';

export const useComplianceCheck = () => {
  const activeTemplate = useSelector(selectActiveTemplate);
  const warnings = useSelector(selectActiveTemplateWarnings);
  const summary = useSelector(selectComplianceSummary);

  const hasWarnings = useMemo(() => warnings.length > 0, [warnings.length]);

  return {
    activeTemplate,
    warnings,
    summary,
    hasWarnings,
  };
};
