import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addAuditLog } from '../store/auditSlice';
import { selectActiveTemplateLabel } from '../store/selectors';
import { useActiveTemplate } from '../hooks/useActiveTemplate';

const PrintButton = () => {
  const dispatch = useDispatch();
  const { activeTemplate } = useActiveTemplate();
  const version = useSelector((state) => state.policyMeta.version);
  const activeTemplateLabel = useSelector(selectActiveTemplateLabel);

  const handlePrint = () => {
    dispatch(
      addAuditLog({
        type: 'PRINT',
        template: activeTemplate,
        policyVersion: version,
        timestamp: new Date().toISOString(),
      }),
    );
    window.print();
  };

  return (
    <div className="print-target-wrap">
      <p className="print-target-label">Ready to print: {activeTemplateLabel}</p>
      <button className="print-btn" onClick={handlePrint} aria-label="Print selected document to PDF">
        Print to PDF
      </button>
    </div>
  );
};

export default React.memo(PrintButton);
