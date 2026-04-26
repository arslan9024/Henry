import React, { useCallback, useId, useState } from 'react';

/**
 * Disclosure — accessible collapsible primitive used across Henry's panels.
 *
 * - Lazy by default: children are not mounted until first opened.
 * - Once mounted, children stay mounted (preserves form state) but are hidden
 *   visually + via aria-hidden when collapsed.
 * - Header is a real <button> with aria-expanded / aria-controls.
 * - Smooth height transition via the CSS grid-row 0fr → 1fr trick.
 *
 * Props:
 *   title       string                 required
 *   subtitle?   string
 *   icon?       ReactNode              left-aligned glyph (emoji or svg)
 *   badge?      ReactNode              right-aligned chip (count, status)
 *   defaultOpen boolean = false
 *   open?       boolean                controlled mode (omit defaultOpen)
 *   onOpenChange?(next) controlled-mode callback
 *   tone?       'default'|'warning'|'danger'|'success'  border accent
 *   lazy?       boolean = true
 *   id?         string                 explicit DOM id (auto otherwise)
 *   className?  string
 *   children    ReactNode
 */
const Disclosure = ({
  title,
  subtitle,
  icon,
  badge,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  tone = 'default',
  lazy = true,
  id,
  className = '',
  children,
}) => {
  const generated = useId();
  const baseId = id || `dx-${generated}`;
  const headerId = `${baseId}-h`;
  const bodyId = `${baseId}-b`;

  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = isControlled ? controlledOpen : internalOpen;

  // Once opened, remember so we don't re-mount children on each toggle.
  const [hasOpened, setHasOpened] = useState(open);

  const toggle = useCallback(() => {
    const next = !open;
    if (next) setHasOpened(true);
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  }, [open, isControlled, onOpenChange]);

  const shouldRender = lazy ? hasOpened : true;

  return (
    <section
      className={`disclosure disclosure--${tone} ${open ? 'is-open' : ''} ${className}`}
      data-open={open ? 'true' : 'false'}
    >
      <button
        type="button"
        id={headerId}
        className="disclosure__header"
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={toggle}
      >
        <span className="disclosure__chevron" aria-hidden="true">
          ▸
        </span>
        {icon ? (
          <span className="disclosure__icon" aria-hidden="true">
            {icon}
          </span>
        ) : null}
        <span className="disclosure__titles">
          <span className="disclosure__title">{title}</span>
          {subtitle ? <span className="disclosure__subtitle">{subtitle}</span> : null}
        </span>
        {badge !== undefined && badge !== null ? <span className="disclosure__badge">{badge}</span> : null}
      </button>
      <div
        id={bodyId}
        role="region"
        aria-labelledby={headerId}
        aria-hidden={!open}
        className="disclosure__outer"
      >
        <div className="disclosure__inner">
          {shouldRender ? <div className="disclosure__body">{children}</div> : null}
        </div>
      </div>
    </section>
  );
};

export default React.memo(Disclosure);
