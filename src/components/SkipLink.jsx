import React from 'react';

/**
 * SkipLink — visually hidden until focused. First focusable element on the
 * page so keyboard / screen-reader users can jump past the navbar straight
 * to the main editing surface (`<main id="main">`).
 *
 * a11y must-fix per Phase 4 step 5. Implemented as a real `<a href="#main">`
 * (not a button-with-onClick) so it works in non-JS contexts AND so the
 * native browser focus-on-anchor behavior fires correctly. We additionally
 * call `focus()` on the target after navigation to handle browsers that
 * scroll-only and don't move focus (Safari).
 */
const SkipLink = () => {
  const handleClick = (e) => {
    const target = document.getElementById('main');
    if (!target) return; // Let the anchor behave natively if main is absent.
    e.preventDefault();
    // Make sure the target can receive focus even if it's a non-interactive
    // landmark; we set tabIndex=-1 in DocumentHubPage but defend in depth.
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: false });
    // Update the URL hash for shareability without triggering router logic.
    if (window.history?.replaceState) {
      window.history.replaceState(null, '', '#main');
    }
  };

  return (
    <a className="skip-link" href="#main" onClick={handleClick}>
      Skip to main content
    </a>
  );
};

export default SkipLink;
