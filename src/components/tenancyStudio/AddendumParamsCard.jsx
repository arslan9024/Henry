/**
 * [Category 1: View]
 * White Caves Real Estate - RERA Addendum Parameters & Statutory Options
 * Dropdowns for maintenance threshold, notice periods, and statutory legal checkboxes (< 85 lines, 0 inline CSS).
 */

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateAddendumParam } from '../../store/tenancyStudioSlice';
import { MAINTENANCE_LIMITS, NOTICE_PERIODS, OCCUPANT_POLICIES } from '../../config/tenancyOptionsConfig';

export const AddendumParamsCard = () => {
  const dispatch = useDispatch();
  const addendumParams = useSelector((state) => state.tenancyStudio.addendumParams);

  const [paintingMandatory, setPaintingMandatory] = useState(true);
  const [noSubleasing, setNoSubleasing] = useState(true);
  const [earlyTerminationFee, setEarlyTerminationFee] = useState(true);
  const [dewaClearanceRequired, setDewaClearanceRequired] = useState(true);

  const handleParamChange = (key, value) => {
    dispatch(updateAddendumParam({ key, value }));
  };

  return (
    <div className="studio-card">
      <div className="studio-card-title">⚙️ Section 6: Specific Tenancy Parameters &amp; Overrides</div>

      <div className="studio-grid-3">
        <div className="studio-field-group">
          <label className="studio-field-label">Minor Maintenance Threshold</label>
          <select
            className="studio-select"
            value={addendumParams.minor_maintenance_limit || 'AED 1,000 (RERA Standard)'}
            onChange={(e) => handleParamChange('minor_maintenance_limit', e.target.value)}
          >
            {MAINTENANCE_LIMITS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="studio-field-group">
          <label className="studio-field-label">Notice of Renewal / Non-Renewal</label>
          <select
            className="studio-select"
            value={addendumParams.notice_days || '90 Days (Dubai Law 26/2007)'}
            onChange={(e) => handleParamChange('notice_days', e.target.value)}
          >
            {NOTICE_PERIODS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <div className="studio-field-group">
          <label className="studio-field-label">Permitted Occupants</label>
          <select
            className="studio-select"
            value={addendumParams.permitted_occupants || 'Family Only'}
            onChange={(e) => handleParamChange('permitted_occupants', e.target.value)}
          >
            {OCCUPANT_POLICIES.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="studio-covenants-wrapper">
        <span className="studio-covenants-title">
          🛡️ Statutory Protection Clauses (Included in Addendum):
        </span>
        <div className="studio-covenants-grid">
          <label className="footer-checkbox-label">
            <input
              type="checkbox"
              checked={paintingMandatory}
              onChange={(e) => setPaintingMandatory(e.target.checked)}
            />
            <span>Painting &amp; Deep Cleaning upon vacating</span>
          </label>
          <label className="footer-checkbox-label">
            <input
              type="checkbox"
              checked={noSubleasing}
              onChange={(e) => setNoSubleasing(e.target.checked)}
            />
            <span>Subleasing &amp; Holiday Homes (Airbnb) Prohibited</span>
          </label>
          <label className="footer-checkbox-label">
            <input
              type="checkbox"
              checked={earlyTerminationFee}
              onChange={(e) => setEarlyTerminationFee(e.target.checked)}
            />
            <span>Early Lease Break Penalty: 2 Months Rent</span>
          </label>
          <label className="footer-checkbox-label">
            <input
              type="checkbox"
              checked={dewaClearanceRequired}
              onChange={(e) => setDewaClearanceRequired(e.target.checked)}
            />
            <span>Deposit release requires DEWA/Chiller clearance</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default AddendumParamsCard;
