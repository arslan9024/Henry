/**
 * [Category 1: View]
 * White Caves Real Estate - Payment Receipt Financials & Bank Details Card
 * Payment mode, UAE bank dropdown, agency commission, and VAT options (< 90 lines, zero inline CSS).
 */

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateReceiptParam } from '../../store/tenancyStudioSlice';
import { PAYMENT_METHODS, UAE_BANKS, COMMISSION_TIERS } from '../../config/receiptOptionsConfig';

export const ReceiptFinancialsCard = () => {
  const dispatch = useDispatch();
  const page1 = useSelector((state) => state.tenancyStudio?.page1 || {});
  const receiptParams = useSelector((state) => state.tenancyStudio?.receiptParams || {});

  const [includeVat, setIncludeVat] = useState(true);
  const [includeDepositVoucher, setIncludeDepositVoucher] = useState(true);

  const handleParamChange = (key, value) => {
    dispatch(updateReceiptParam({ key, value }));
  };

  return (
    <div className="studio-card">
      <div className="studio-card-title">💵 Payment Receipt &amp; Banking Parameters</div>
      <div className="studio-grid-3">
        <div className="studio-field-group">
          <label className="studio-field-label">Payment Mode</label>
          <select className="studio-select" defaultValue={PAYMENT_METHODS[0]}>
            {PAYMENT_METHODS.map((pm) => (
              <option key={pm} value={pm}>
                {pm}
              </option>
            ))}
          </select>
        </div>

        <div className="studio-field-group">
          <label className="studio-field-label">Tenant Issuing Bank</label>
          <select className="studio-select" defaultValue={UAE_BANKS[0]}>
            {UAE_BANKS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div className="studio-field-group">
          <label className="studio-field-label">Agency Commission Tier</label>
          <select className="studio-select" defaultValue={COMMISSION_TIERS[0]}>
            {COMMISSION_TIERS.map((ct) => (
              <option key={ct} value={ct}>
                {ct}
              </option>
            ))}
          </select>
        </div>

        <div className="studio-field-group">
          <label className="studio-field-label">Annual Rent</label>
          <input
            type="text"
            className="studio-input"
            value={receiptParams.rent_display || page1.annual_rent || ''}
            onChange={(e) => handleParamChange('rent_display', e.target.value)}
          />
        </div>

        <div className="studio-field-group">
          <label className="studio-field-label">Agency Commission (AED)</label>
          <input
            type="text"
            className="studio-input"
            value={receiptParams.agency_fee_display || ''}
            onChange={(e) => handleParamChange('agency_fee_display', e.target.value)}
            placeholder="e.g. 6,000"
          />
        </div>

        <div className="studio-field-group">
          <label className="studio-field-label">Total Receivable (AED)</label>
          <input
            type="text"
            className="studio-input"
            value={receiptParams.total_display || ''}
            onChange={(e) => handleParamChange('total_display', e.target.value)}
            placeholder="e.g. 132,300"
          />
        </div>
      </div>

      <div className="receipt-checkboxes-row">
        <label className="footer-checkbox-label">
          <input type="checkbox" checked={includeVat} onChange={(e) => setIncludeVat(e.target.checked)} />
          <span>Include 5% UAE VAT on Commission (Generates FTA Tax Invoice)</span>
        </label>
        <label className="footer-checkbox-label">
          <input
            type="checkbox"
            checked={includeDepositVoucher}
            onChange={(e) => setIncludeDepositVoucher(e.target.checked)}
          />
          <span>Include Security Deposit Receipt Voucher (5% / 10%)</span>
        </label>
      </div>
    </div>
  );
};

export default ReceiptFinancialsCard;
