/**
 * [Category 1: View]
 * White Caves Real Estate - Step 3: Payment Receipt & Cheques Schedule Orchestrator
 * Clean Single-Purpose Architecture (< 35 lines, 0 inline CSS).
 */

import React from 'react';
import ReceiptFinancialsCard from './ReceiptFinancialsCard';
import ChequeScheduleTableCard from './ChequeScheduleTableCard';

export const StudioStep3Receipt = () => {
  return (
    <div className="step-wrapper">
      <div className="step-header-banner">
        <h2>🧾 Step 3: Payment Receipt &amp; Cheques Schedule (Page 7)</h2>
        <p>
          Configure UAE payment method, issuing bank, agency fee, and statutory 5% VAT. Review the installment
          schedule below.
        </p>
      </div>

      <ReceiptFinancialsCard />

      <ChequeScheduleTableCard />
    </div>
  );
};

export default StudioStep3Receipt;
