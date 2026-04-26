import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectSaveState } from '../store/uiSlice';

/**
 * AutosaveIndicator — calm pill in TopNavbar that mirrors document edit
 * → save lifecycle. Three resting states:
 *   • idle    → "Up to date"   (no edits since boot)
 *   • saving  → "Saving…"      (between dirty and the debounced flush)
 *   • saved   → "Saved <ago>"  (relative time, ticks every 30s)
 *
 * The dirty/saving/saved state lives in `uiSlice` and is fed by:
 *   1. A matcher inside uiSlice that flips to `dirty` on every `document/*`
 *      Redux action (T-39).
 *   2. The `useAutosaveDebounce` effect in <App> that waits 600ms of quiet
 *      then dispatches `markSaved(Date.now())`.
 *
 * Persistence note: Henry already mirrors documents to localStorage via the
 * existing `archiveService` + `setDocumentValue` flow. This pill does NOT
 * own persistence — it OBSERVES it. Even if persistence were a no-op the
 * pill would still correctly reflect "user paused typing → state quiesced".
 */
const formatAgo = (savedAt, now) => {
  if (!savedAt) return '';
  const seconds = Math.max(0, Math.round((now - savedAt) / 1000));
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const d = new Date(savedAt);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `at ${hh}:${mm}`;
};

const TONE_BY_STATUS = {
  idle: 'neutral',
  saving: 'warning',
  saved: 'success',
};

const ICON_BY_STATUS = {
  idle: '○',
  saving: '◐',
  saved: '✓',
};

const LABEL_BASE = {
  idle: 'Up to date',
  saving: 'Saving…',
  saved: 'Saved',
};

export default function AutosaveIndicator() {
  const { status, lastSavedAt } = useSelector(selectSaveState);
  // Tick once a minute so the relative timestamp doesn't go stale while
  // the user is reading the form. Skipped while saving (label is static).
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (status !== 'saved') return undefined;
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, [status]);

  const tone = TONE_BY_STATUS[status] || 'neutral';
  const ago = status === 'saved' ? formatAgo(lastSavedAt, now) : '';
  const label = status === 'saved' && ago ? `${LABEL_BASE.saved} ${ago}` : LABEL_BASE[status];

  return (
    <span
      className="autosave-pill"
      data-status={status}
      data-tone={tone}
      role="status"
      aria-live="polite"
      title={
        lastSavedAt ? `Last saved at ${new Date(lastSavedAt).toLocaleTimeString()}` : 'No edits saved yet'
      }
    >
      <span className="autosave-pill__icon" aria-hidden="true" data-spin={status === 'saving'}>
        {ICON_BY_STATUS[status]}
      </span>
      <span className="autosave-pill__label">{label}</span>
    </span>
  );
}
