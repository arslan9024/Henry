import React from 'react';
import clsx from './clsx';

/**
 * Spinner — loading indicator that replaces the bare "Preparing…" text
 * in PrintButton and the (currently absent) loading state in
 * FileExtractionPanel and ChatDock.
 *
 * Sizes: sm (12px) / md (16px) / lg (24px).
 * `label` is the screen-reader announcement (defaults to "Loading").
 *
 * Respects `prefers-reduced-motion` via the existing `--motion-*` tokens
 * (the keyframes use the `--motion-spin` token defined in app.css).
 */
function Spinner({ size = 'md', label = 'Loading', className, ...rest }) {
  return (
    <span
      role="status"
      aria-live="polite"
      data-size={size}
      className={clsx('ui-spinner', className)}
      {...rest}
    >
      <span className="ui-spinner__ring" aria-hidden="true" />
      <span className="ui-spinner__sr">{label}</span>
    </span>
  );
}

export default Spinner;
