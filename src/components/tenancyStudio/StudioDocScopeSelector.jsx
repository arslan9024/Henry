/**
 * [Category 1: View]
 * White Caves Real Estate - Studio Document Scope Selector
 * Checkboxes for Ejari Contract, RERA Addendum, Payment Receipt (< 50 lines, 0 inline CSS).
 */

import React from 'react';
import PropTypes from 'prop-types';

export const StudioDocScopeSelector = ({
  combineContract,
  setCombineContract,
  combineAddendum,
  setCombineAddendum,
  combineReceipt,
  setCombineReceipt,
}) => {
  return (
    <div className="studio-footer-center" role="group" aria-label="Included Documents Selector">
      <span className="footer-scope-label">Combine:</span>
      <label className="footer-checkbox-label">
        <input
          type="checkbox"
          checked={combineContract}
          onChange={(e) => setCombineContract(e.target.checked)}
        />
        <span>Ejari Contract (P1–3)</span>
      </label>
      <label className="footer-checkbox-label">
        <input
          type="checkbox"
          checked={combineAddendum}
          onChange={(e) => setCombineAddendum(e.target.checked)}
        />
        <span>RERA Addendum (P4–6)</span>
      </label>
      <label className="footer-checkbox-label">
        <input
          type="checkbox"
          checked={combineReceipt}
          onChange={(e) => setCombineReceipt(e.target.checked)}
        />
        <span>Payment Receipt (P7)</span>
      </label>
    </div>
  );
};

StudioDocScopeSelector.propTypes = {
  combineContract: PropTypes.bool.isRequired,
  setCombineContract: PropTypes.func.isRequired,
  combineAddendum: PropTypes.bool.isRequired,
  setCombineAddendum: PropTypes.func.isRequired,
  combineReceipt: PropTypes.bool.isRequired,
  setCombineReceipt: PropTypes.func.isRequired,
};

export default StudioDocScopeSelector;
