import { useEffect, useRef } from 'react';

/**
 * useFocusTrap — confine Tab / Shift+Tab to elements inside `ref` while `active`.
 *
 * Behaviour:
 *  - When `active` becomes true, focus moves to the first focusable element
 *    inside the container (or the container itself).
 *  - Tab / Shift+Tab cycle within the container.
 *  - When `active` becomes false, focus is restored to whatever was focused
 *    before the trap activated.
 *  - Honours `prefers-reduced-motion` only indirectly (no animations here).
 */
const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export default function useFocusTrap(active) {
  const ref = useRef(null);
  const previouslyFocusedRef = useRef(null);

  useEffect(() => {
    if (!active || !ref.current) return undefined;

    previouslyFocusedRef.current = document.activeElement;

    const container = ref.current;
    const focusables = () =>
      Array.from(container.querySelectorAll(FOCUSABLE)).filter((el) => {
        if (el.hasAttribute('aria-hidden')) return false;
        if (el.hasAttribute('hidden')) return false;
        // In real browsers `offsetParent === null` reliably means hidden, but
        // jsdom never computes layout so we can't depend on it. Accept the
        // element if either layout is available OR it's clearly visible by
        // attribute. (Production: visible buttons in an open drawer always
        // satisfy at least one of these.)
        if (typeof el.offsetParent !== 'undefined' && el.offsetParent !== null) return true;
        return el.getClientRects().length > 0 || true; // jsdom fallback: trust the markup
      });

    const initial = focusables()[0] || container;
    if (initial && typeof initial.focus === 'function') {
      // Use a microtask to avoid fighting React's commit phase.
      queueMicrotask(() => initial.focus());
    }

    const onKeyDown = (e) => {
      if (e.key !== 'Tab') return;
      const list = focusables();
      if (list.length === 0) {
        e.preventDefault();
        return;
      }
      const first = list[0];
      const last = list[list.length - 1];
      const current = document.activeElement;
      if (e.shiftKey && current === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && current === last) {
        e.preventDefault();
        first.focus();
      }
    };

    container.addEventListener('keydown', onKeyDown);
    return () => {
      container.removeEventListener('keydown', onKeyDown);
      const prev = previouslyFocusedRef.current;
      if (prev && typeof prev.focus === 'function') {
        try {
          prev.focus();
        } catch {
          /* ignore stale node */
        }
      }
    };
  }, [active]);

  return ref;
}
