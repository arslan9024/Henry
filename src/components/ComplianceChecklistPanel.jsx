import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { evaluateCompliance } from '../compliance/ruleEngine';
import { acknowledgeChecklist, setWarningsForTemplate } from '../store/complianceSlice';
import { useComplianceCheck } from '../hooks/useComplianceCheck';
import { useDocumentData } from '../hooks/useDocumentData';

const ComplianceChecklistPanel = () => {
  const dispatch = useDispatch();
  const { activeTemplate, warnings, summary } = useComplianceCheck();
  const documentData = useDocumentData();
  const acknowledged = useSelector(
    (state) => state.compliance.checklistAcknowledgedByTemplate[activeTemplate] || false,
  );

  useEffect(() => {
    const result = evaluateCompliance(activeTemplate, documentData);
    dispatch(setWarningsForTemplate({ templateKey: activeTemplate, warnings: result }));
  }, [activeTemplate, documentData, dispatch]);

  return (
    <aside className="checklist-panel print-hidden" aria-label="Compliance checklist panel">
      <h3>Compliance Checklist (DLD/RERA Aligned)</h3>
      <p className="policy-meta">Mode: warnings-first | Template: {activeTemplate}</p>
      <ul className="summary-list">
        <li>Critical: {summary.critical}</li>
        <li>Important: {summary.important}</li>
        <li>Info: {summary.info}</li>
      </ul>

      <div className="warning-list">
        {warnings.map((warning) => (
          <div key={warning.id} className={`warning-item ${warning.severity}`}>
            <strong>{warning.severity.toUpperCase()}</strong>
            <p>{warning.message}</p>
          </div>
        ))}
      </div>

      <label className="acknowledge-row">
        <input
          type="checkbox"
          checked={acknowledged}
          onChange={(e) =>
            dispatch(
              acknowledgeChecklist({
                templateKey: activeTemplate,
                acknowledged: e.target.checked,
              }),
            )
          }
        />
        Reviewed by operations/compliance before issue
      </label>
    </aside>
  );
};

export default React.memo(ComplianceChecklistPanel);
