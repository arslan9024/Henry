/**
 * [Category 1: View]
 * White Caves Real Estate - Step 2: RERA Addendum Builder Orchestrator
 * Clean Single-Purpose Architecture (< 35 lines, 0 inline CSS).
 */

import React from 'react';
import AddendumParamsCard from './AddendumParamsCard';
import AddendumStatutoryViewer from './AddendumStatutoryViewer';

export const StudioStep2Addendum = () => {
  return (
    <div className="step-wrapper">
      <div className="step-header-banner">
        <h2>📑 Step 2: 3-Page Official RERA Addendum Inputs (Pages 4–6)</h2>
        <p>
          Tenant &amp; landlord details, rent, and premises are synchronized automatically. Review statutory
          clauses and configure parameter overrides below.
        </p>
      </div>

      <AddendumParamsCard />

      <AddendumStatutoryViewer />
    </div>
  );
};

export default StudioStep2Addendum;
