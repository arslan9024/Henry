/**
 * [Category 1: View]
 * White Caves Real Estate - Studio Top Stepper Navigation
 * Renders the 4 interactive step pills and Toolbox toggle when in Tenancy Studio (< 75 lines).
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentStep, toggleToolboxModal } from '../../store/tenancyStudioSlice';

const STEPS = [
  { step: 1, label: 'Deal Inputs', icon: '📝' },
  { step: 2, label: 'RERA Addendum', icon: '⚖️' },
  { step: 3, label: 'Cheques & Receipt', icon: '💳' },
  { step: 4, label: 'Review & Export', icon: '🚀' },
];

export const StudioStepperNav = () => {
  const dispatch = useDispatch();
  const currentStep = useSelector((state) => state.tenancyStudio.currentStep || 1);

  return (
    <div className="top-nav-stepper-wrap" role="navigation" aria-label="Studio Phase Stepper">
      <div className="top-nav-stepper-track">
        {STEPS.map((s) => {
          const isActive = currentStep === s.step;
          return (
            <button
              key={s.step}
              type="button"
              onClick={() => dispatch(setCurrentStep(s.step))}
              className={`top-nav-stepper-btn ${isActive ? 'is-active' : ''}`}
              aria-current={isActive ? 'step' : undefined}
            >
              <span>{s.icon}</span>
              <span>
                {s.step}. {s.label}
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => dispatch(toggleToolboxModal(true))}
        className="top-nav-stepper-toolbox"
        title="Open Tenancy Studio Tool Box"
      >
        🧰 Toolbox
      </button>
    </div>
  );
};

export default React.memo(StudioStepperNav);
