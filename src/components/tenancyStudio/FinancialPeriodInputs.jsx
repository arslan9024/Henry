/**
 * [Category 1: View]
 * FinancialPeriodInputs - Start date, end date, and grace period controls (< 50 lines, 0 inline CSS).
 */

import React from 'react';
import PropTypes from 'prop-types';
import { GRACE_PERIODS } from '../../config/tenancyOptionsConfig';

export const FinancialPeriodInputs = ({ dateFrom, dateTo, onChange }) => {
  return (
    <>
      <div className="studio-field-group">
        <label className="studio-field-label">Contract Start Date</label>
        <input
          type="text"
          className="studio-input"
          value={dateFrom || ''}
          onChange={(e) => onChange('date_from', e.target.value)}
          placeholder="DD-MM-YYYY"
        />
      </div>
      <div className="studio-field-group">
        <label className="studio-field-label">Contract End Date</label>
        <input
          type="text"
          className="studio-input"
          value={dateTo || ''}
          onChange={(e) => onChange('date_to', e.target.value)}
          placeholder="DD-MM-YYYY"
        />
      </div>
      <div className="studio-field-group">
        <label className="studio-field-label">Move-In Grace Period</label>
        <select className="studio-select" defaultValue={GRACE_PERIODS[0]}>
          {GRACE_PERIODS.map((gp) => (
            <option key={gp} value={gp}>
              {gp}
            </option>
          ))}
        </select>
      </div>
    </>
  );
};

FinancialPeriodInputs.propTypes = {
  dateFrom: PropTypes.string,
  dateTo: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

export default FinancialPeriodInputs;
