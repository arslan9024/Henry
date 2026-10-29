/**
 * [Category 1: View]
 * White Caves Real Estate - 24 DLD Form Fields Grid Orchestrator
 * Clean Single-Purpose Architecture (< 40 lines).
 */

import React from 'react';
import PartiesCard from './PartiesCard';
import PropertySpecsCard from './PropertySpecsCard';
import FinancialTermsCard from './FinancialTermsCard';

export const StudioDldFieldGrid = () => {
  return (
    <>
      <PartiesCard />
      <PropertySpecsCard />
      <FinancialTermsCard />
    </>
  );
};

export default StudioDldFieldGrid;
