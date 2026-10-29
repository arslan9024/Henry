/**
 * [Category 1: View]
 * White Caves Real Estate - Client Move-In & Handover Summary Card
 * Move-in cards for Tenant, Property Allocation, and Payment Structure (< 50 lines, 0 inline CSS).
 */

import React from 'react';
import { useSelector } from 'react-redux';

const EMPTY_PAGE1 = {};

export const ClientHandoverSummaryCard = () => {
  const page1 = useSelector((state) => state.tenancyStudio?.page1 || EMPTY_PAGE1);
  const chequeCount = useSelector((state) => state.tenancyStudio?.chequeCount || 4);

  return (
    <div className="studio-card">
      <div className="studio-card-title">🔑 Client Move-In &amp; Handover Summary</div>
      <div className="handover-grid">
        <div className="handover-box">
          <div className="handover-box__title">Tenant Handover</div>
          <div className="handover-box__subtitle">{page1.tenant_name || 'Tenant Name'}</div>
          <div className="handover-box__phone">{page1.tenant_phone || 'Phone'}</div>
        </div>
        <div className="handover-box">
          <div className="handover-box__title">Property Allocation</div>
          <div className="handover-box__subtitle">
            {page1.property_no || 'Unit'}, {page1.building_name || 'Building'}
          </div>
          <div className="handover-box__dewa">DEWA: {page1.dewa_premises || 'N/A'}</div>
        </div>
        <div className="handover-box">
          <div className="handover-box__title">Payment Structure</div>
          <div className="handover-box__subtitle">
            {page1.annual_rent || '0 AED'} ({chequeCount} Cheques)
          </div>
          <div className="handover-box__deposit">Deposit: {page1.security_deposit || 'N/A'}</div>
        </div>
      </div>
    </div>
  );
};

export default ClientHandoverSummaryCard;
