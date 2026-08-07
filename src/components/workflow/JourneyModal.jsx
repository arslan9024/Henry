import React from 'react';
import { Button, Modal } from '../ui';
import JourneyStepper from './JourneyStepper';

const JourneyModal = ({
  open,
  onClose,
  title,
  steps = [],
  currentStep = 0,
  onStepChange,
  children,
  onBack,
  onNext,
  onFinish,
  backDisabled = false,
  nextDisabled = false,
  finishDisabled = false,
  finishLabel = 'Finish',
}) => {
  const isFirst = currentStep <= 0;
  const isLast = currentStep >= steps.length - 1;

  return (
    <Modal open={open} onClose={onClose} title={title} size="lg">
      <Modal.Body>
        <JourneyStepper steps={steps} currentStep={currentStep} onStepChange={onStepChange} />
        <div className="journey-modal__content">{children}</div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="ghost" onClick={isFirst ? onClose : onBack} disabled={backDisabled}>
          {isFirst ? 'Close' : 'Back'}
        </Button>
        {!isLast ? (
          <Button variant="primary" onClick={onNext} disabled={nextDisabled}>
            Next
          </Button>
        ) : (
          <Button variant="primary" onClick={onFinish} disabled={finishDisabled}>
            {finishLabel}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default JourneyModal;
