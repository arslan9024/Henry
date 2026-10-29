/**
 * [Category 1: View]
 * White Caves Real Estate - Multi-Cheque Schedule Table Card
 * Frequency switcher pills & calculated cheque installments (< 60 lines, 0 inline CSS).
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setChequeCount } from '../../store/tenancyStudioSlice';
import { calculateChequeSchedule } from '../../services/tenancyStudio/chequeCalculator';
import { CHEQUE_FREQUENCIES } from '../../config/receiptOptionsConfig';
import { ChequeScheduleTable } from './ChequeScheduleTable';

export const ChequeScheduleTableCard = () => {
  const dispatch = useDispatch();
  const page1 = useSelector((state) => state.tenancyStudio.page1);
  const chequeCount = useSelector((state) => state.tenancyStudio.chequeCount || 4);

  const schedule = calculateChequeSchedule({
    annualRent: page1.annual_rent,
    chequeCount,
    startDate: page1.date_from || '01-10-2026',
  });

  return (
    <div className="studio-card">
      <div className="studio-card-header-row">
        <div className="studio-card-title-plain">💳 Multi-Cheque Maturity Schedule</div>
        <div className="cheque-pill-row">
          {CHEQUE_FREQUENCIES.map((cnt) => (
            <button
              key={cnt}
              type="button"
              onClick={() => dispatch(setChequeCount(cnt))}
              className={`cheque-pill ${chequeCount === cnt ? 'cheque-pill--active' : ''}`}
            >
              {cnt} {cnt === 1 ? 'Cheque' : 'Cheques'}
            </button>
          ))}
        </div>
      </div>

      <ChequeScheduleTable schedule={schedule} />
    </div>
  );
};

export default ChequeScheduleTableCard;
