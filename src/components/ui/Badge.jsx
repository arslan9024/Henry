import React from 'react';
import clsx from './clsx';

/**
 * Badge — semantic status pill replacing the ad-hoc `.compliance-badge`
 * + `.toast` colour treatments scattered across `app.css`.
 *
 * Tones: neutral / info / success / warning / critical / accent.
 * Sizes: sm (16px) / md (20px, default).
 *
 * `dot` renders just a coloured circle — useful in tight rows
 * (audit log, sidebar tabs).
 */
function Badge({ tone = 'neutral', size = 'md', dot = false, className, children, ...rest }) {
  if (dot) {
    return (
      <span
        data-tone={tone}
        data-size={size}
        className={clsx('ui-badge-dot', className)}
        {...rest}
        aria-hidden="true"
      />
    );
  }
  return (
    <span data-tone={tone} data-size={size} className={clsx('ui-badge', className)} {...rest}>
      {children}
    </span>
  );
}

export default Badge;
