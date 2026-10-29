/**
 * [Category 1: View]
 * White Caves Real Estate - Contract Comparison & Visual Diff Modal (ContractDiffModal.jsx)
 * Clean single-purpose orchestrator component (< 90 lines, zero inline CSS).
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { updatePage1Field } from '../../store/tenancyStudioSlice';
import { advanceRenewalDates } from '../../services/tenancyStudio/renewalDateCalculator';
import { buildDiffRows } from '../../config/tenancyStudio/contractDiffConfig';
import { useModalA11y } from '../../hooks/useModalA11y';
import ContractDiffTable from './ContractDiffTable';

export const ContractDiffModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const page1 = useSelector((state) => state.tenancyStudio?.page1 || {});
  const renewalDates = advanceRenewalDates(page1.date_from, page1.date_to);
  const trapRef = useModalA11y(isOpen, onClose);
  const diffRows = buildDiffRows(page1, renewalDates);
  const [selectedFields, setSelectedFields] = useState(['date_from', 'date_to']);

  if (!isOpen) return null;

  const toggleField = (key) => {
    setSelectedFields((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const handleApplyAll = () => {
    if (selectedFields.includes('date_from') && renewalDates.startDate) {
      dispatch(updatePage1Field({ field: 'date_from', value: renewalDates.startDate }));
    }
    if (selectedFields.includes('date_to') && renewalDates.endDate) {
      dispatch(updatePage1Field({ field: 'date_to', value: renewalDates.endDate }));
    }
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Contract Comparison and Diff Modal"
      className="diff-modal__backdrop"
      onClick={onClose}
    >
      <div ref={trapRef} className="diff-modal__dialog" onClick={(e) => e.stopPropagation()}>
        <div className="diff-modal__header">
          <div>
            <h3 className="diff-modal__title">⚖️ Previous Contract vs. Renewal Comparison Diff</h3>
            <p className="diff-modal__subtitle">
              Side-by-side inspection of terms. Advance renewal dates and roll over security deposits.
            </p>
          </div>
          <button
            type="button"
            className="diff-modal__close-btn"
            onClick={onClose}
            aria-label="Close diff modal"
          >
            ✕
          </button>
        </div>

        <ContractDiffTable diffRows={diffRows} selectedFields={selectedFields} onToggleField={toggleField} />

        <div className="diff-modal__footer">
          <button type="button" className="diff-modal__cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="diff-modal__apply-btn" onClick={handleApplyAll}>
            Apply Renewal Values ({selectedFields.length} selected)
          </button>
        </div>
      </div>
    </div>
  );
};

ContractDiffModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ContractDiffModal;
