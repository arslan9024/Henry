import React, { useMemo, useState } from 'react';

/**
 * Sticky section table-of-contents for long forms/templates.
 *
 * - Renders as a compact nav pill row
 * - Click scrolls to section id, updates URL hash via replaceState
 * - Uses `aria-current="true"` on active item for AT feedback
 */
const SectionToc = ({ sections = [], className = '', title = 'Quick sections' }) => {
  const cleaned = useMemo(
    () =>
      (sections || []).filter(
        (s) => s && typeof s.id === 'string' && s.id.trim() && typeof s.label === 'string' && s.label.trim(),
      ),
    [sections],
  );

  const [activeId, setActiveId] = useState(() => cleaned[0]?.id || null);

  if (cleaned.length === 0) return null;

  const jump = (id) => {
    const el = document.getElementById(id);
    if (!el) return;

    setActiveId(id);
    el.scrollIntoView?.({ behavior: 'smooth', block: 'start' });

    try {
      const nextHash = `#${id}`;
      if (window.location.hash !== nextHash) {
        window.history.replaceState(null, '', nextHash);
      }
    } catch {
      // no-op in restricted environments
    }
  };

  return (
    <nav className={`section-toc ${className}`.trim()} aria-label={title}>
      <span className="section-toc__label">{title}</span>
      <div className="section-toc__list" role="list">
        {cleaned.map((section) => {
          const active = section.id === activeId;
          return (
            <button
              key={section.id}
              type="button"
              className={`section-toc__item${active ? ' is-active' : ''}`}
              aria-current={active ? 'true' : undefined}
              onClick={() => jump(section.id)}
              title={`Jump to ${section.label}`}
            >
              {section.icon ? <span aria-hidden="true">{section.icon} </span> : null}
              {section.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default React.memo(SectionToc);
