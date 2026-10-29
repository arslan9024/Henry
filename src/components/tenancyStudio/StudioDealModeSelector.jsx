/**
 * [Category 1: View]
 * White Caves Real Estate - Contract Mode Selector (Renewal vs New)
 * Clean single-purpose component with Diff Modal trigger (< 70 lines, 0 inline CSS).
 */

import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { updatePage1Field } from '../../store/tenancyStudioSlice';
import { advanceRenewalDates } from '../../services/tenancyStudio/renewalDateCalculator';

export const StudioDealModeSelector = ({ contractMode, onModeChange, onOpenDiffModal }) => {
  const dispatch = useDispatch();
  const page1 = useSelector((state) => state.tenancyStudio.page1);

  const handleApplyRenewal = () => {
    onModeChange('renewal');
    const res = advanceRenewalDates(page1.date_from, page1.date_to);
    if (res.startDate) dispatch(updatePage1Field({ field: 'date_from', value: res.startDate }));
    if (res.endDate) dispatch(updatePage1Field({ field: 'date_to', value: res.endDate }));
    if (res.contractDate) dispatch(updatePage1Field({ field: 'contract_date', value: res.contractDate }));
  };

  return (
    <div className="mode-selector-wrapper">
      <div className="contract-mode-selector" role="radiogroup" aria-label="Contract Mode Selection">
        <div
          className={`mode-choice-card ${contractMode === 'renewal' ? 'active-mode-card' : ''}`}
          onClick={handleApplyRenewal}
          role="radio"
          aria-checked={contractMode === 'renewal'}
          tabIndex={0}
        >
          <div className="mode-card-icon">🔄</div>
          <div>
            <div className="mode-card-title">Renewal Tenancy Contract</div>
            <div className="mode-card-desc">Advances dates by +1 calendar year and rolls over deposits.</div>
          </div>
        </div>

        <div
          className={`mode-choice-card ${contractMode === 'new' ? 'active-mode-card' : ''}`}
          onClick={() => onModeChange('new')}
          role="radio"
          aria-checked={contractMode === 'new'}
          tabIndex={0}
        >
          <div className="mode-card-icon">🆕</div>
          <div>
            <div className="mode-card-title">New Tenancy Contract</div>
            <div className="mode-card-desc">First-time lease for a new tenant with full KYC onboarding.</div>
          </div>
        </div>
      </div>

      {contractMode === 'renewal' && onOpenDiffModal && (
        <div className="mode-selector-action-row">
          <button type="button" className="mode-diff-btn" onClick={onOpenDiffModal}>
            <span>⚖️</span>
            <span>Side-by-Side Old vs. Renewal Contract Diff</span>
          </button>
        </div>
      )}
    </div>
  );
};

StudioDealModeSelector.propTypes = {
  contractMode: PropTypes.string.isRequired,
  onModeChange: PropTypes.func.isRequired,
  onOpenDiffModal: PropTypes.func,
};

export default StudioDealModeSelector;
