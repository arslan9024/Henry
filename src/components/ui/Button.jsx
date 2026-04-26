import React from 'react';
import clsx from './clsx';

/**
 * Button — the canonical primitive that replaces every hand-rolled button
 * style across Henry (`.print-btn`, `.utility-btn`, `.density-toggle`,
 * `.toolbar-btn`, etc.).
 *
 * Variants:
 *   - primary  : the accent-coloured CTA. Used at most once per view.
 *   - secondary: surface-tone outlined button. The default.
 *   - ghost    : text-only, hover-tinted. For low-emphasis actions.
 *   - danger   : destructive actions (delete, clear log).
 *
 * Sizes: sm (28px) / md (36px, default) / lg (44px touch-friendly).
 *
 * Accessibility:
 *   - `loading` disables the button AND announces busy state.
 *   - `iconLeft`/`iconRight` slots accept any node; they're aria-hidden
 *     when the button has visible text.
 *   - Focus ring uses the `--focus-ring` token so it adapts to dark mode.
 */
const Button = React.forwardRef(function Button(
  {
    variant = 'secondary',
    size = 'md',
    iconLeft,
    iconRight,
    loading = false,
    disabled = false,
    fullWidth = false,
    type = 'button',
    className,
    children,
    ...rest
  },
  ref,
) {
  const isDisabled = disabled || loading;
  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      data-variant={variant}
      data-size={size}
      data-loading={loading || undefined}
      data-full-width={fullWidth || undefined}
      className={clsx('ui-btn', className)}
      {...rest}
    >
      {loading ? <span className="ui-btn__spinner" aria-hidden="true" /> : null}
      {iconLeft ? (
        <span className="ui-btn__icon" aria-hidden="true">
          {iconLeft}
        </span>
      ) : null}
      {children ? <span className="ui-btn__label">{children}</span> : null}
      {iconRight ? (
        <span className="ui-btn__icon" aria-hidden="true">
          {iconRight}
        </span>
      ) : null}
    </button>
  );
});

export default Button;
