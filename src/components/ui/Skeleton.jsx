import React from 'react';
import clsx from './clsx';

/**
 * Skeleton — shimmering placeholder for content that's still loading.
 * Shipping zero of these today; this primitive unlocks the Phase-5 polish
 * pass for the archive + audit + info-articles panels.
 *
 * Variants: text (one line) / rect (block) / circle (avatar).
 * Sizes are caller-controlled via `width` / `height` props.
 *
 * `lines` repeats a text variant N times with slight width jitter
 * (looks more natural than identical bars).
 *
 * The shimmer animation is purely CSS; reduced-motion users get a
 * solid placeholder via the `prefers-reduced-motion` block in app.css.
 */
function Skeleton({ variant = 'text', width, height, lines = 1, className, style: styleProp, ...rest }) {
  if (variant === 'text' && lines > 1) {
    const items = [];
    for (let i = 0; i < lines; i += 1) {
      // Last line ends slightly short so it reads as natural prose.
      const w = i === lines - 1 ? '60%' : '100%';
      items.push(
        <span
          key={i}
          data-variant="text"
          className={clsx('ui-skeleton', className)}
          style={{ width: w, ...styleProp }}
          aria-hidden="true"
        />,
      );
    }
    return (
      <span role="status" aria-label="Loading" className="ui-skeleton-group">
        {items}
      </span>
    );
  }
  return (
    <span
      role="status"
      aria-label="Loading"
      data-variant={variant}
      className={clsx('ui-skeleton', className)}
      style={{ width, height, ...styleProp }}
      {...rest}
    />
  );
}

export default Skeleton;
