# Session 21 — Audit Persistence + Undo Toast + Raw-JSON Expansion

**Date:** 2026-04-23  
**Tracker Task:** T-16  
**Status:** ✅ Shipped  
**Build:** Green (12.24s, 0 errors, 0 warnings)

---

## Scope
Address three items from the Session 20 deferred list in one pass:
1. **Audit log persistence** — survive browser refresh
2. **Undo toast on Clear** — recoverable destructive action
3. **Per-row raw-JSON expansion** — full event detail without leaving the panel

## Work Log

### 1. `auditSlice.js` (rewritten)
- `STORAGE_KEY = 'henry.audit.logs'` + `MAX_ENTRIES = 100`
- `loadInitial()` reads + parses + caps on store boot; safe on SSR / no-localStorage / corrupted JSON (returns `[]`)
- `persist()` mirrors after every mutation; try/catch for quota exceeded / private mode
- `addAuditLog`: existing behavior + `persist`
- `clearAuditLogs`: existing behavior + `persist` (writes empty array)
- **NEW** `restoreAuditLogs(snapshot)`: replaces slice from a payload; same cap; persists. Powers Undo and could power JSON re-import in future.

### 2. `uiSlice.pushToast.prepare` — action descriptor
- Accepts optional `action: { label, type, payload }`
- Validated to be serializable (Redux best practice — toasts now live in state long enough to be inspected by devtools)
- `null` if missing or malformed (defensive)

### 3. `ToastHost.jsx` — inline action button
- Renders `<button class="toast__action">{action.label}</button>` when `toast.action` present
- onClick: `dispatch({ type, payload })` then `dismissToast(toast.id)`
- Sits between body and close button; `align-self: center`

### 4. `AuditLogPanel.jsx` — Undo flow + expansion
- **Clear** now snapshots logs before dispatching, then pushes a `warning` toast with `durationMs: 10000` and `action: { label: 'Undo', type: restoreAuditLogs.type, payload: snapshot }`. Undo is one click.
- **Per-row expansion**: local `expanded` `Set<rowKey>`, `toggleExpanded` mutates a copy. Row header is now a `<button class="audit-list__head--btn">` with chevron (▸/▾) and `aria-expanded`. When expanded, renders `<pre><code>JSON.stringify(entry, null, 2)</code></pre>` with `max-height: 240px; overflow: auto`.
- `confirm` message updated: "You'll have ~10 seconds to undo." (sets correct expectation).

### 5. CSS (~50 lines appended)
- `.audit-list__head--btn` resets button, hover-tints type chip
- `.audit-list__chevron` (margin-left auto)
- `.audit-list__raw` styled monospace block: surface-2 background, soft border, max-height scroll, word-break for long values
- `.toast__action` outline-style button (border = currentColor, transparent bg)

## Validation
- `get_errors` clean on all 4 touched files
- `npm run build` → ✅ 12.24s (slower this run due to background load), 0 warnings

## Decisions
| Decision | Rationale |
|----------|-----------|
| localStorage instead of IndexedDB | 100-entry cap means total payload is ~10-50 kB at most — well within localStorage's 5 MB budget. IDB would add async complexity for no user-visible benefit at this scale. Migration path is straightforward when needed. |
| Persist on every mutation, not on interval/unload | Simpler; no risk of losing the last entry on crash/refresh. Cost is one `JSON.stringify` per event, which for ≤100 entries is sub-millisecond. |
| 10-second Undo window (not 5s) | Audit log is rarely cleared and the consequences are large; users deserve more thinking time than for normal toasts. |
| Action descriptor inline in toast (not via callback) | Keeps toasts fully serializable (Redux discipline). Anything callable couldn't be persisted/devtool-inspected. The trade-off is action types must already exist in some slice. |
| Per-row JSON in `<pre>` instead of nested Disclosure | One Disclosure per day is already the navigation layer; adding a second level felt heavy. The chevron+pre pattern keeps each row visually flat. |
| Single `expanded` Set (not boolean per row) | Cleaner than mapping; `Set` mutation is O(1); React re-renders only when the Set identity changes (we always return a new one). |

## Risks
- **localStorage quota** — at 100 entries with the largest events (`LLM_FILE_BULK_APPLIED` with `fields: string[]`) total stays under 30 kB. If event payloads grow significantly (e.g. embedding extracted text), reconsider IDB.
- **Undo doesn't restore items added in the 10-second window** — if the user clears, then triggers a new event before clicking Undo, the new event is overwritten by the snapshot. Acceptable: clearing is intentional and rare; new events during the undo window are unusual.
- **Raw JSON could expose long internal payloads** — currently capped at 240px scroll, but if an event grows huge (e.g. 100-field bulk apply) the row gets visually heavy. `max-height` mitigates this.

## Tracker Updates
- Progress: **15/15 → 16/16 (100%)**
- New row: T-16 added under ✅ Done
- Validation log: Session 21 build entry

## Files Touched
- `src/store/auditSlice.js` (full rewrite: persist + restoreAuditLogs)
- `src/store/uiSlice.js` (toast `action` descriptor)
- `src/components/ToastHost.jsx` (inline action button)
- `src/components/AuditLogPanel.jsx` (Undo + per-row JSON expansion)
- `src/styles/app.css` (+~50 lines)
- `plans/implementation/IMPLEMENTATION_TRACKER.md` (T-16 row + validation log)

## Deferred (handoff)
- JSON import (re-hydrate from a previously-exported file) — `restoreAuditLogs` is already wired and ready
- Audit log search box (free-text across summaries)
- IndexedDB backend if log payloads grow beyond ~100 KB
- Empirical Ctrl+P print test on all 8 templates (manual only)
