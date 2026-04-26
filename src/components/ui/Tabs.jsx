import React, { useState, useRef, useId } from 'react';
import clsx from './clsx';

/**
 * Tabs — accessible tablist with arrow-key navigation.
 *
 * Controlled or uncontrolled. Wires the WAI-ARIA tabs pattern:
 *  • role=tablist on the strip
 *  • role=tab + aria-selected on each trigger
 *  • role=tabpanel + aria-labelledby on each panel
 *  • Arrow Left/Right move focus AND activation (automatic activation pattern)
 *  • Home / End jump to first/last
 *
 * Usage:
 *   <Tabs items={[
 *     { id: 'overview', label: 'Overview', content: <Overview/> },
 *     { id: 'rules',    label: 'Rules',    content: <Rules/> },
 *   ]} />
 */
export default function Tabs({ items, defaultActive, active: activeProp, onChange, className, ariaLabel }) {
  const baseId = useId();
  const [internalActive, setInternalActive] = useState(defaultActive ?? items[0]?.id);
  const isControlled = activeProp !== undefined;
  const active = isControlled ? activeProp : internalActive;
  const tabRefs = useRef({});

  const setActive = (id) => {
    if (!isControlled) setInternalActive(id);
    onChange?.(id);
  };

  const onKeyDown = (e) => {
    const idx = items.findIndex((i) => i.id === active);
    if (idx < 0) return;
    let next = null;
    if (e.key === 'ArrowRight') next = (idx + 1) % items.length;
    else if (e.key === 'ArrowLeft') next = (idx - 1 + items.length) % items.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = items.length - 1;
    if (next !== null) {
      e.preventDefault();
      const id = items[next].id;
      setActive(id);
      tabRefs.current[id]?.focus();
    }
  };

  return (
    <div className={clsx('ui-tabs', className)}>
      <div role="tablist" aria-label={ariaLabel} className="ui-tabs__list">
        {items.map((item) => {
          const tabId = `${baseId}-tab-${item.id}`;
          const panelId = `${baseId}-panel-${item.id}`;
          const isActive = item.id === active;
          return (
            <button
              key={item.id}
              ref={(n) => (tabRefs.current[item.id] = n)}
              id={tabId}
              role="tab"
              type="button"
              aria-selected={isActive}
              aria-controls={panelId}
              tabIndex={isActive ? 0 : -1}
              className="ui-tabs__tab"
              data-active={isActive ? 'true' : undefined}
              onClick={() => setActive(item.id)}
              onKeyDown={onKeyDown}
              disabled={item.disabled}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item) => {
        const tabId = `${baseId}-tab-${item.id}`;
        const panelId = `${baseId}-panel-${item.id}`;
        const isActive = item.id === active;
        return (
          <div
            key={item.id}
            role="tabpanel"
            id={panelId}
            aria-labelledby={tabId}
            hidden={!isActive}
            className="ui-tabs__panel"
          >
            {isActive && item.content}
          </div>
        );
      })}
    </div>
  );
}
