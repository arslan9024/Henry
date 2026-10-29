/**
 * [Category 1: View]
 * White Caves Real Estate - Tenancy Financial Terms Card
 * Dates, Annual Rent, Security Deposit, Grace Period & Utility Responsibilities (< 45 lines, 0 inline CSS).
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updatePage1Field } from '../../store/tenancyStudioSlice';
import { FinancialPeriodInputs } from './FinancialPeriodInputs';
import { RentAndDepositInputs } from './RentAndDepositInputs';

export const FinancialTermsCard = () => {
  const dispatch = useDispatch();
  const page1 = useSelector((state) => state.tenancyStudio.page1);

  const handleChange = (field, value) => {
    dispatch(updatePage1Field({ field, value }));
  };

  return (
    <div className="studio-card">
      <div className="studio-card-title">💰 Financial &amp; Tenancy Period Terms</div>
      <div className="studio-grid-2">
        <FinancialPeriodInputs dateFrom={page1.date_from} dateTo={page1.date_to} onChange={handleChange} />
        <RentAndDepositInputs
          annualRent={page1.annual_rent}
          securityDeposit={page1.security_deposit}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

export default FinancialTermsCard;
