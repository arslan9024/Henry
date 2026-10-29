/**
 * [Category 1: View]
 * White Caves Real Estate - Right Panel Regulatory Compliance Scope
 * Legal authority and DLD/RERA metadata (< 60 lines).
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { selectPolicyMeta } from '../../../store/selectors';

export const RightPanelRegulatoryMeta = () => {
  const policyMeta = useSelector(selectPolicyMeta);

  return (
    <div className="right-panel__section-card right-panel__meta-card">
      <div className="right-panel__section-header">
        <span>Regulatory Authority</span>
      </div>
      <div className="right-panel__dld-title">Dubai Land Department (DLD) / RERA</div>
      <div className="right-panel__dld-policy">
        Policy {policyMeta.version} · Reviewed {policyMeta.reviewedAt}
      </div>
      <div className="right-panel__dld-statute">✓ UAE Federal Law No. 26/2007 · Decree No. 43/2013</div>
    </div>
  );
};

export default React.memo(RightPanelRegulatoryMeta);
