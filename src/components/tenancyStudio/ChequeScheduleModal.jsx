/**
 * [Category 1: View]
 * White Caves Real Estate - Dubai Cheque Schedule Modal
 * Clean, accessible dialog displaying calculated cheque installments (< 65 lines, 0 inline CSS).
 */

import React from 'react';
import PropTypes from 'prop-types';
import { useModalA11y } from '../../hooks/useModalA11y';
import { ChequeScheduleTable } from './ChequeScheduleTable';

export const ChequeScheduleModal = ({ isOpen, onClose, schedule, chequeCount, annualRent, startDate }) => {
  const trapRef = useModalA11y(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div
      className="cheque-modal__backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Dubai Cheque Installment Schedule"
    >
      <div ref={trapRef} className="cheque-modal__container" onClick={(e) => e.stopPropagation()}>
        <div className="cheque-modal__header">
          <h3 className="cheque-modal__title">
            💳 Dubai Cheque Installment Schedule ({chequeCount} Cheques)
          </h3>
          <button
            type="button"
            className="cheque-modal__close-btn"
            onClick={onClose}
            aria-label="Close Schedule Modal"
          >
            ✕
          </button>
        </div>

        <p className="cheque-modal__subtitle">
          Annual Rent: <strong>{annualRent}</strong> · Start Date: <strong>{startDate}</strong>
        </p>

        <ChequeScheduleTable schedule={schedule} />

        <div className="cheque-modal__footer">
          <button type="button" className="cheque-modal__action-btn" onClick={onClose}>
            Close Schedule
          </button>
        </div>
      </div>
    </div>
  );
};

ChequeScheduleModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  schedule: PropTypes.arrayOf(PropTypes.object).isRequired,
  chequeCount: PropTypes.number.isRequired,
  annualRent: PropTypes.string.isRequired,
  startDate: PropTypes.string.isRequired,
};

export default ChequeScheduleModal;
