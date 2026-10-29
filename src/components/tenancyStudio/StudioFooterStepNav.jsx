/**
 * [Category 1: View]
 * White Caves Real Estate - Studio Footer Step Navigation
 * Clean single-purpose component (< 45 lines, 0 inline CSS).
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentStep } from '../../store/tenancyStudioSlice';

export const StudioFooterStepNav = () => {
  const dispatch = useDispatch();
  const currentStep = useSelector((state) => state.tenancyStudio.currentStep || 1);

  return (
    <div className="studio-footer-left">
      <button
        type="button"
        className={`footer-btn footer-btn-nav ${currentStep === 1 ? 'footer-btn-nav--disabled' : ''}`}
        onClick={() => dispatch(setCurrentStep(Math.max(1, currentStep - 1)))}
        disabled={currentStep === 1}
      >
        ← Previous Step
      </button>

      <span className="footer-step-counter">Phase {currentStep} of 4</span>

      <button
        type="button"
        className={`footer-btn footer-btn-nav ${currentStep === 4 ? 'footer-btn-nav--disabled' : ''}`}
        onClick={() => dispatch(setCurrentStep(Math.min(4, currentStep + 1)))}
        disabled={currentStep === 4}
      >
        Next Step →
      </button>
    </div>
  );
};

export default StudioFooterStepNav;
