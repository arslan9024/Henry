import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { evaluateCompliance } from '../compliance/ruleEngine';
import { knowledgeBaseMeta } from '../compliance/knowledgeBase';
import { acknowledgeChecklist, setWarningsForTemplate } from '../store/complianceSlice';
import { useComplianceCheck } from '../hooks/useComplianceCheck';
import { useDocumentData } from '../hooks/useDocumentData';
import Disclosure from './Disclosure';

const SEVERITY_ORDER = ['critical', 'important', 'info'];
const SEVERITY_TONE = { critical: 'danger', important: 'warning', info: 'default' };
const SEVERITY_ICON = { critical: '🛑', important: '⚠️', info: 'ℹ️' };
const SEVERITY_LABEL = { critical: 'Critical', important: 'Important', info: 'Info' };

const groupBySeverity = (warnings) => {
  const groups = { critical: [], important: [], info: [] };
  warnings.forEach((w) => {
    const key = SEVERITY_ORDER.includes(w.severity) ? w.severity : 'info';
    groups[key].push(w);
  });
  return groups;
};

const ComplianceChecklistPanel = () => {
  const dispatch = useDispatch();
  const { activeTemplate, warnings, summary } = useComplianceCheck();
  const documentData = useDocumentData();
  const acknowledged = useSelector(
    (state) => state.compliance.checklistAcknowledgedByTemplate[activeTemplate] || false,
  );

  // Keep the slice in sync with current document state. (Same behaviour as before.)
  useEffect(() => {
    const result = evaluateCompliance(activeTemplate, documentData);
    dispatch(setWarningsForTemplate({ templateKey: activeTemplate, warnings: result }));
  }, [activeTemplate, documentData, dispatch]);

  const groups = useMemo(() => groupBySeverity(warnings), [warnings]);

  return (
    <aside className="checklist-panel print-hidden" aria-label="Compliance checklist panel">
      <h3>Compliance Checklist (DLD/RERA Aligned)</h3>
      <p className="policy-meta">Mode: warnings-first | Template: {activeTemplate}</p>
      <p className="policy-meta">
        Knowledge Base {knowledgeBaseMeta.version} • {knowledgeBaseMeta.verificationStatus}
      </p>
      <ul className="summary-list">
        <li>Critical: {summary.critical}</li>
        <li>Important: {summary.important}</li>
        <li>Info: {summary.info}</li>
      </ul>

      {warnings.length === 0 ? (
        <div className="disclosure disclosure--success" style={{ padding: '12px' }}>
          ✅ No outstanding compliance warnings for this document.
        </div>
      ) : null}

      {SEVERITY_ORDER.map((sev) => {
        const items = groups[sev];
        if (!items.length) return null;
        return (
          <Disclosure
            key={sev}
            title={SEVERITY_LABEL[sev]}
            icon={SEVERITY_ICON[sev]}
            tone={SEVERITY_TONE[sev]}
            badge={items.length}
            defaultOpen={sev === 'critical'}
          >
            <div className="warning-list">
              {items.map((warning) => (
                <div key={warning.id} className={`warning-item ${warning.severity}`}>
                  <strong>
                    {warning.severity.toUpperCase()} {warning.title ? `• ${warning.title}` : ''}
                  </strong>
                  <p>{warning.message}</p>
                  {warning.sourceTitle ? <p className="warning-meta">Source: {warning.sourceTitle}</p> : null}
                  {warning.citation ? <p className="warning-meta">{warning.citation}</p> : null}
                </div>
              ))}
            </div>
          </Disclosure>
        );
      })}

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
