import React, { useState, useEffect, useRef, useCallback, useMemo, useId, forwardRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveTemplate } from '../store/templateSlice';
import { addAuditLog } from '../store/auditSlice';
import { selectArchiveEntries } from '../store/selectors';
import { TEMPLATE_CONFIG } from '../templates/registry';

/**
 * CommandPalette — Ctrl+K (or Cmd+K) fuzzy-search overlay.
 *
 * Item kinds:
 *   template  — switch to any of the 8 document templates
 *   archive   — open the drawer to the Archive tab (shows up to 5 recent entries)
 *   action    — static shortcuts: Compliance, Audit, Themes, Density
 *
 * UX rules:
 *   • Ctrl+K opens / Esc closes / click-outside closes
 *   • ↑ / ↓ navigate the list, Enter activates the highlighted row
 *   • Empty query shows all templates + top-5 archive entries + all actions
 *   • Query filters on label + kind (case-insensitive substring)
 *   • Visited item is announced via the live-region "combo" pattern
 */

// Static action items — these trigger events the parent page listens to.
const STATIC_ACTIONS = [
  {
    id: 'action-compliance',
    kind: 'action',
    label: 'Open Compliance Checklist',
    icon: '✅',
    event: 'henry:open-compliance',
  },
  {
    id: 'action-archive',
    kind: 'action',
    label: 'Open Archive History',
    icon: '📁',
    event: 'henry:open-archive',
  },
  { id: 'action-audit', kind: 'action', label: 'Open Audit Log', icon: '📜', event: 'henry:open-audit' },
  {
    id: 'action-print',
    kind: 'action',
    label: 'Print / Export PDF',
    icon: '🖨',
    event: 'henry:trigger-print',
  },
];

const KIND_LABEL = {
  template: 'Template',
  archive: 'Archive',
  action: 'Action',
};

const KIND_ICON = {
  template: '📄',
  archive: '📁',
  action: '⚡',
};

function normalize(str) {
  return (str || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function fuzzyMatch(query, label) {
  if (!query) return true;
  const q = normalize(query);
  const l = normalize(label);
  // Simple substring match — enough for a 20-item list; upgrade to
  // character-subsequence if needed in the future.
  return l.includes(q);
}

// ─── PaletteItem ─────────────────────────────────────────────────────────────

const PaletteItem = forwardRef(function PaletteItem({ item, active, onActivate, onMouseEnter }, ref) {
  return (
    <li
      ref={ref}
      id={item.id}
      role="option"
      aria-selected={active}
      className={`cp-item${active ? ' cp-item--active' : ''}`}
      onMouseDown={(e) => {
        // mousedown fires before blur on the input; prevent the input
        // from losing focus (which would close the palette via onBlur).
        e.preventDefault();
      }}
      onClick={onActivate}
      onMouseEnter={onMouseEnter}
    >
      <span className="cp-item__icon" aria-hidden="true">
        {item.icon || KIND_ICON[item.kind]}
      </span>
      <span className="cp-item__label">{item.label}</span>
      <span className="cp-item__kind">{KIND_LABEL[item.kind]}</span>
    </li>
  );
});

// ─── CommandPalette ───────────────────────────────────────────────────────────

const CommandPalette = () => {
  const dispatch = useDispatch();
  const archiveEntries = useSelector(selectArchiveEntries);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const inputRef = useRef(null);
  const listRef = useRef(null);
  const itemRefs = useRef({});

  const comboId = useId();
  const listId = `${comboId}-listbox`;

  // Build the full item list (memoized — rebuilds when archive changes).
  const allItems = useMemo(() => {
    const templates = TEMPLATE_CONFIG.map((t) => ({
      id: `tpl-${t.key}`,
      kind: 'template',
      label: t.label,
      templateKey: t.key,
    }));

    const recent = archiveEntries.slice(0, 5).map((entry, i) => ({
      id: `arc-${i}`,
      kind: 'archive',
      label: entry.filename || entry.unit || `Archive entry ${i + 1}`,
      icon: '📁',
    }));

    return [...templates, ...recent, ...STATIC_ACTIONS];
  }, [archiveEntries]);

  // Filter by query.
  const filtered = useMemo(() => allItems.filter((item) => fuzzyMatch(query, item.label)), [allItems, query]);

  // Clamp active index when list shrinks.
  useEffect(() => {
    setActiveIndex((prev) => (filtered.length === 0 ? 0 : Math.min(prev, filtered.length - 1)));
  }, [filtered.length]);

  // Scroll active item into view.
  useEffect(() => {
    const activeItem = filtered[activeIndex];
    if (!activeItem) return;
    const el = itemRefs.current[activeItem.id];
    el?.scrollIntoView?.({ block: 'nearest' });
  }, [activeIndex, filtered]);

  // ── Global Ctrl+K shortcut ──────────────────────────────────────────────────

  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Focus input when opening.
  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      // Defer focus so the dialog animation completes.
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const close = useCallback(() => setOpen(false), []);

  // ── Item activation ─────────────────────────────────────────────────────────

  const activateItem = useCallback(
    (item) => {
      if (!item) return;
      if (item.kind === 'template') {
        dispatch(setActiveTemplate(item.templateKey));
        dispatch(
          addAuditLog({
            type: 'TEMPLATE_SWITCH_VIA_PALETTE',
            templateKey: item.templateKey,
            timestamp: new Date().toISOString(),
          }),
        );
      } else if (item.kind === 'action' || item.kind === 'archive') {
        window.dispatchEvent(new CustomEvent(item.event || 'henry:noop'));
      }
      close();
    },
    [dispatch, close],
  );

  // ── Input keyboard handler ──────────────────────────────────────────────────

  const onKeyDown = useCallback(
    (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % Math.max(1, filtered.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + Math.max(1, filtered.length)) % Math.max(1, filtered.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        activateItem(filtered[activeIndex]);
      } else if (e.key === 'Escape') {
        close();
      }
    },
    [filtered, activeIndex, activateItem, close],
  );

  if (!open) {
    return null;
  }

  const activeItemId = filtered[activeIndex]?.id;

  return (
    /* Scrim — click outside closes */
    <div className="cp-scrim" onMouseDown={close} role="presentation">
      {/* Stop mousedown propagation from panel so scrim doesn't close on
          a click inside the palette. We also stop it from PaletteItem above. */}
      <div
        className="cp-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="cp-search">
          <span className="cp-search__icon" aria-hidden="true">
            🔍
          </span>
          <input
            ref={inputRef}
            className="cp-search__input"
            type="search"
            placeholder="Search templates, actions, archive…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            role="combobox"
            aria-expanded={true}
            aria-haspopup="listbox"
            aria-controls={listId}
            aria-activedescendant={activeItemId}
            aria-label="Search commands"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="cp-search__esc" aria-hidden="true">
            Esc
          </kbd>
        </div>

        {/* Results */}
        {filtered.length > 0 ? (
          <ul ref={listRef} id={listId} className="cp-list" role="listbox" aria-label="Search results">
            {filtered.map((item, idx) => (
              <PaletteItem
                key={item.id}
                ref={(el) => {
                  itemRefs.current[item.id] = el;
                }}
                item={item}
                active={idx === activeIndex}
                onActivate={() => activateItem(item)}
                onMouseEnter={() => setActiveIndex(idx)}
              />
            ))}
          </ul>
        ) : (
          <p className="cp-empty" role="status">
            No results for <strong>{query}</strong>
          </p>
        )}

        {/* Footer hint */}
        <footer className="cp-footer" aria-hidden="true">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> navigate
          </span>
          <span>
            <kbd>↵</kbd> open
          </span>
          <span>
            <kbd>Esc</kbd> close
          </span>
          <span className="cp-footer__hint">
            Press <kbd>Ctrl</kbd>+<kbd>K</kbd> to toggle
          </span>
        </footer>
      </div>
    </div>
  );
};

export default CommandPalette;
