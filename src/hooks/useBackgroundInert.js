import { useEffect } from 'react';

/**
 * useBackgroundInert — make the rest of the app non-interactive while a
 * dialog/drawer/chat panel is open.
 *
 * Any element marked with `data-overlay-shield` will receive the `inert`
 * attribute (and `aria-hidden="true"` as a fallback for older AT) while at
 * least one overlay is active. We use a module-scoped ref-count so multiple
 * concurrent overlays don't fight (e.g. drawer open + chat open).
 *
 * Usage:
 *   useBackgroundInert(open);
 */
let activeCount = 0;
const SELECTOR = '[data-overlay-shield]';

function apply() {
  if (typeof document === 'undefined') return;
  const els = document.querySelectorAll(SELECTOR);
  els.forEach((el) => {
    if (activeCount > 0) {
      el.setAttribute('inert', '');
      el.setAttribute('aria-hidden', 'true');
    } else {
      el.removeAttribute('inert');
      el.removeAttribute('aria-hidden');
    }
  });
}

export default function useBackgroundInert(active) {
  useEffect(() => {
    if (!active) return undefined;
    activeCount += 1;
    apply();
    return () => {
      activeCount = Math.max(0, activeCount - 1);
      apply();
    };
  }, [active]);
}
