import React, { Children, cloneElement, useId, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import clsx from './clsx';

/**
 * Tooltip — non-intrusive hover/focus label for icon-only controls.
 *
 * Usage:
 *   <Tooltip label="Print document">
 *     <IconButton aria-label="Print">🖨</IconButton>
 *   </Tooltip>
 *
 * Implementation notes:
 *  • Renders into a portal to escape overflow/transform ancestors.
 *  • Position computed relative to the trigger via getBoundingClientRect on show.
 *  • Wires aria-describedby on the trigger so screen readers also benefit
 *    (the tooltip is supplementary, not a replacement for aria-label).
 *  • Shows on mouseenter/focus, hides on mouseleave/blur/Escape.
 */
export default function Tooltip({ label, children, side = 'top', delay = 250 }) {
  const id = useId();
  const tipId = `tip-${id}`;
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const timerRef = useRef(null);

  const show = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const node = triggerRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const offset = 8;
      let top = rect.top - offset;
      let left = rect.left + rect.width / 2;
      if (side === 'bottom') top = rect.bottom + offset;
      if (side === 'left') {
        top = rect.top + rect.height / 2;
        left = rect.left - offset;
      }
      if (side === 'right') {
        top = rect.top + rect.height / 2;
        left = rect.right + offset;
      }
      setCoords({ top: top + window.scrollY, left: left + window.scrollX });
      setOpen(true);
    }, delay);
  };

  const hide = () => {
    clearTimeout(timerRef.current);
    setOpen(false);
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') hide();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Clone single child to attach handlers + ref + aria-describedby
  const child = Children.only(children);
  const trigger = cloneElement(child, {
    ref: (node) => {
      triggerRef.current = node;
      const { ref } = child;
      if (typeof ref === 'function') ref(node);
      else if (ref && typeof ref === 'object') ref.current = node;
    },
    onMouseEnter: (e) => {
      child.props.onMouseEnter?.(e);
      show();
    },
    onMouseLeave: (e) => {
      child.props.onMouseLeave?.(e);
      hide();
    },
    onFocus: (e) => {
      child.props.onFocus?.(e);
      show();
    },
    onBlur: (e) => {
      child.props.onBlur?.(e);
      hide();
    },
    'aria-describedby': clsx(child.props['aria-describedby'], open && tipId),
  });

  return (
    <>
      {trigger}
      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <span
            id={tipId}
            role="tooltip"
            className="ui-tooltip"
            data-side={side}
            style={{ top: coords.top, left: coords.left }}
          >
            {label}
          </span>,
          document.body,
        )}
    </>
  );
}
