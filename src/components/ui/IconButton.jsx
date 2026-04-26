import React from 'react';
import clsx from './clsx';

/**
 * IconButton — square, label-required button for icon-only affordances
 * (close ✕, expand ◀, etc.). ALWAYS requires `aria-label` so screen
 * readers can announce the action.
 *
 * Variants: ghost (default, transparent) / solid (filled chip).
 * Sizes: sm / md / lg.
 */
const IconButton = React.forwardRef(function IconButton(
  { variant = 'ghost', size = 'md', disabled = false, type = 'button', className, children, ...rest },
  ref,
) {
  if (import.meta.env.MODE !== 'production' && !rest['aria-label'] && !rest['aria-labelledby']) {
    // eslint-disable-next-line no-console
    console.warn(
      '[Henry/IconButton] icon-only button is missing `aria-label` or `aria-labelledby`. Screen readers will skip it.',
    );
  }
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      data-variant={variant}
      data-size={size}
      className={clsx('ui-icon-btn', className)}
      {...rest}
    >
      <span aria-hidden="true">{children}</span>
    </button>
  );
});

export default IconButton;
