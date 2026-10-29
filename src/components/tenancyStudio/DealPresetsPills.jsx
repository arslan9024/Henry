/**
 * [Category 1: View]
 * White Caves Real Estate - 1-Click Deal Presets Pills
 * Quick presets for Marina 1BR, Downtown Luxury, and Commercial Office (< 50 lines, zero inline CSS).
 */

import React from 'react';
import { useDispatch } from 'react-redux';
import { applyDealPreset } from '../../store/tenancyStudioSlice';

export const DealPresetsPills = () => {
  const dispatch = useDispatch();

  return (
    <div className="deal-presets-row">
      <div className="deal-presets-pills">
        <span className="deal-presets-title">⚡ 1-Click Deal Presets:</span>
        <div className="deal-presets-btn-group">
          <button
            type="button"
            onClick={() => dispatch(applyDealPreset('marina-1br'))}
            className="preset-btn"
            title="Dubai Marina 1BR (2 Cheques, Unfurnished)"
          >
            🌊 Marina 1BR
          </button>
          <button
            type="button"
            onClick={() => dispatch(applyDealPreset('downtown-luxury'))}
            className="preset-btn"
            title="Downtown Luxury (4 Cheques, Furnished)"
          >
            🏙️ Downtown Luxury
          </button>
          <button
            type="button"
            onClick={() => dispatch(applyDealPreset('business-bay-commercial'))}
            className="preset-btn"
            title="Business Bay Office (1 Cheque, Commercial)"
          >
            🏢 Commercial Office
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(DealPresetsPills);
