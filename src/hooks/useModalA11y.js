/**
 * [Category 2: Business Logic / Hook]
 * useModalA11y - Accessibility and Keyboard Controller for Modal Dialogs
 * Combines focus trapping, Escape key listener, and focus restoration (< 65 lines).
 */

import { useEffect, useRef } from 'react';
import useFocusTrap from './useFocusTrap';

export const useModalA11y = (isOpen, onClose) => {
  const trapRef = useFocusTrap(isOpen);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        e.preventDefault();
        e.stopPropagation();
        if (onCloseRef.current) {
          onCloseRef.current();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return trapRef;
};

export default useModalA11y;
