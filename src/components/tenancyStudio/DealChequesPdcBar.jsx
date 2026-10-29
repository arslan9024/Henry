/**
 * [Category 1: View]
 * White Caves Real Estate - Deal Cheques & Security Deposit Bar
 * Cheque count selector, schedule preview trigger, and furnished toggle (< 75 lines, zero inline CSS).
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setChequeCount, setIsFurnished } from '../../store/tenancyStudioSlice';
import {
  calculateChequeSchedule,
  calculateSecurityDeposit,
} from '../../services/tenancyStudio/chequeCalculator';

export const DealChequesPdcBar = ({ onOpenSchedule }) => {
  const dispatch = useDispatch();
  const page1 = useSelector((state) => state.tenancyStudio?.page1 || {});
  const chequeCount = useSelector((state) => state.tenancyStudio?.chequeCount || 4);
  const isFurnished = useSelector((state) => state.tenancyStudio?.isFurnished || false);

  const schedule = calculateChequeSchedule({
    annualRent: page1.annual_rent,
    chequeCount,
    startDate: page1.date_from || '01-10-2026',
  });

  const depositInfo = calculateSecurityDeposit({
    annualRent: page1.annual_rent,
    isFurnished,
  });

  return (
    <div className="deal-cheques-bar">
      <div className="deal-cheques-bar__group">
        <span className="deal-cheques-bar__label">💳 Cheques:</span>
        <div className="deal-cheques-bar__btn-group">
          {[1, 2, 4, 6, 12].map((cnt) => (
            <button
              key={cnt}
              type="button"
              onClick={() => dispatch(setChequeCount(cnt))}
              className={`cheque-count-btn ${chequeCount === cnt ? 'is-active' : ''}`}
            >
              {cnt}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onOpenSchedule}
          className="schedule-summary-btn"
          title="Open Cheque Schedule Breakdown"
        >
          📅 Schedule ({schedule[0]?.amountFormatted || ''} ea)
        </button>
      </div>

      <div className="deal-cheques-bar__group">
        <button
          type="button"
          onClick={() => dispatch(setIsFurnished(!isFurnished))}
          className={`furnished-toggle-btn ${isFurnished ? 'is-furnished' : ''}`}
        >
          {isFurnished ? '🛋️ Furnished (10%)' : '🏢 Unfurnished (5%)'}
        </button>
        <span className="deal-cheques-bar__deposit">Deposit: {depositInfo.amountFormatted}</span>
      </div>
    </div>
  );
};

export default React.memo(DealChequesPdcBar);
