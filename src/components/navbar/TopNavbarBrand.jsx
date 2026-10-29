/**
 * [Category 1: View]
 * White Caves Real Estate - Top Navbar Brand Header
 * Brand logo, title, and left rail hamburger toggle (< 50 lines).
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectPolicyMeta } from '../../store/selectors';
import { toggleLeftRail } from '../../store/uiCommandSlice';

export const TopNavbarBrand = () => {
  const dispatch = useDispatch();
  const policyMeta = useSelector(selectPolicyMeta);

  return (
    <div className="top-navbar__primary">
      <div className="top-navbar__utility-row">
        <button
          type="button"
          className="top-navbar__hamburger"
          onClick={() => dispatch(toggleLeftRail())}
          aria-label="Toggle sidebar"
          title="Toggle sidebar"
        >
          ☰
        </button>
        <span className="top-navbar__workspace-badge">4× upgraded workspace</span>
      </div>

      <div className="top-navbar__brand">
        <img src="/logo.png" alt="White Caves Real Estate" className="top-navbar__logo" />
        <div className="top-navbar__brand-copy">
          <h1>Henry — Document Operations</h1>
          <p>White Caves Real Estate L.L.C · Dubai · DLD/RERA Workflow</p>
          <div className="top-navbar__meta-row">
            <small>
              Policy {policyMeta.version} · Reviewed {policyMeta.reviewedAt}
            </small>
            <span className="top-navbar__meta-pill">Precision filing cockpit</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(TopNavbarBrand);
