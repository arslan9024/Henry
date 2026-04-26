import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import clsx from './clsx';
import IconButton from './IconButton';

/**
 * Modal — built on the native <dialog> element. Why native?
 *  • Free focus trap (the browser handles tab containment)
 *  • Free ESC handling (cancel event)
 *  • Free top-layer rendering (always paints above everything, no z-index war)
 *  • Free backdrop pseudo-element (::backdrop)
 *  • inert is auto-applied to the rest of the page
 *
 * We layer on top:
 *  • Portal to document.body (avoids transform/overflow ancestors clipping)
 *  • Click-outside-to-close (compares event target to dialog rect)
 *  • Optional title (renders header), and Modal.Body / Modal.Footer subcomponents
 *  • aria-labelledby auto-wired when `title` is provided
 *
 * Usage:
 *   <Modal open={isOpen} onClose={() => setOpen(false)} title="Confirm delete">
 *     <Modal.Body>Are you sure?</Modal.Body>
 *     <Modal.Footer>
 *       <Button onClick={() => setOpen(false)}>Cancel</Button>
 *       <Button variant="danger" onClick={handleConfirm}>Delete</Button>
 *     </Modal.Footer>
 *   </Modal>
 */
function Modal({ open, onClose, title, children, size = 'md', closeOnBackdrop = true, className, ...rest }) {
  const dialogRef = useRef(null);
  const titleId = useRef(`modal-title-${Math.random().toString(36).slice(2, 9)}`).current;

  // Sync `open` prop with the native dialog open/close methods
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Wire ESC (the browser fires `cancel`) and the close handler
  const handleCancel = useCallback(
    (e) => {
      e.preventDefault(); // prevent default close so React owns the open state
      onClose?.();
    },
    [onClose],
  );

  // Click on backdrop (clicks on the dialog itself land on a child element;
  // a click whose target IS the dialog is necessarily on the ::backdrop).
  const handleClick = useCallback(
    (e) => {
      if (!closeOnBackdrop) return;
      if (e.target === dialogRef.current) onClose?.();
    },
    [closeOnBackdrop, onClose],
  );

  if (typeof document === 'undefined') return null;

  return createPortal(
    <dialog
      ref={dialogRef}
      className={clsx('ui-modal', className)}
      data-size={size}
      aria-labelledby={title ? titleId : undefined}
      onCancel={handleCancel}
      onClick={handleClick}
      {...rest}
    >
      <div className="ui-modal__panel" onClick={(e) => e.stopPropagation()}>
        {title && (
          <header className="ui-modal__header">
            <h2 id={titleId} className="ui-modal__title">
              {title}
            </h2>
            <IconButton aria-label="Close dialog" variant="ghost" size="sm" onClick={() => onClose?.()}>
              ✕
            </IconButton>
          </header>
        )}
        {children}
      </div>
    </dialog>,
    document.body,
  );
}

Modal.Body = function ModalBody({ className, ...rest }) {
  return <div className={clsx('ui-modal__body', className)} {...rest} />;
};

Modal.Footer = function ModalFooter({ className, ...rest }) {
  return <div className={clsx('ui-modal__footer', className)} {...rest} />;
};

export default Modal;
