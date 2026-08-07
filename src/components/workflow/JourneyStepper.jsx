import React from 'react';
import { Button } from '../ui';

const JourneyStepper = ({ steps = [], currentStep = 0, onStepChange, locked = false }) => {
  return (
    <ol className="journey-stepper" aria-label="Journey steps">
      {steps.map((step, idx) => {
        const isActive = idx === currentStep;
        const isDone = idx < currentStep;
        const disabled = locked ? idx !== currentStep : idx > currentStep + 1;
        return (
          <li key={step.id || step.label} className={`journey-stepper__item ${isActive ? 'is-active' : ''}`}>
            <Button
              variant={isActive ? 'primary' : 'ghost'}
              size="sm"
              disabled={disabled}
              onClick={() => onStepChange?.(idx)}
              className="journey-stepper__btn"
              aria-current={isActive ? 'step' : undefined}
            >
              <span className="journey-stepper__index" aria-hidden="true">
                {isDone ? '✓' : idx + 1}
              </span>
              <span>{step.label}</span>
            </Button>
          </li>
        );
      })}
    </ol>
  );
};

export default JourneyStepper;
