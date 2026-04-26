import React from 'react';
import clsx from './clsx';

/**
 * Card — surfaces grouped content with consistent radius + elevation.
 * Replaces ad-hoc `.review-card`, `.archive-item`, raw `<div>` chrome.
 *
 * Variants:
 *   - surface  : flat background, no border (default — sits inside drawers/panels)
 *   - outlined : border, no shadow (best in dense lists)
 *   - elevated : shadow-md, no border (lifts off the page)
 *
 * Padding scales: none / sm / md (default) / lg.
 *
 * The component is a thin styled wrapper — semantic role stays `<div>`
 * unless caller passes `as="section"` etc.
 */
function Card({
  variant = 'surface',
  padding = 'md',
  interactive = false,
  className,
  as: Tag = 'div',
  children,
  ...rest
}) {
  return (
    <Tag
      data-variant={variant}
      data-padding={padding}
      data-interactive={interactive || undefined}
      className={clsx('ui-card', className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}

function CardHeader({ className, children, ...rest }) {
  return (
    <div className={clsx('ui-card__header', className)} {...rest}>
      {children}
    </div>
  );
}

function CardBody({ className, children, ...rest }) {
  return (
    <div className={clsx('ui-card__body', className)} {...rest}>
      {children}
    </div>
  );
}

function CardFooter({ className, children, ...rest }) {
  return (
    <div className={clsx('ui-card__footer', className)} {...rest}>
      {children}
    </div>
  );
}

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
