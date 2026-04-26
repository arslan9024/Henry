# Session 20 — Audit Log Viewer Panel

**Date:** 2026-04-23  
**Tracker Task:** T-15  
**Status:** ✅ Shipped  
**Build:** Green (6.42s, CSS 33.83 kB, no warnings)

---

## Scope
Surface the audit trail that has been silently collected since Session 12. Until now, every PDF generation, compliance check, chat-applied field, file upload, and extraction event was written to `state.audit.logs` (capped at 100, newest-first) with no UI to view, filter, or export them. This session ships the viewer.

## Work Log

### 1. `src/store/auditSlice.js`
Added `clearAuditLogs` reducer (resets `logs` to `[]`). `addAuditLog` unchanged.

### 2. `src/components/AuditLogPanel.jsx` (NEW, ~180 lines)
- **Grouping**: `dayKey(iso)` formats each timestamp as a localized day label; entries bucketed via `Map` preserving insertion order; rendered as one `<Disclosure>` per day with the most recent day `defaultOpen`.
- **Tone classification**: `TYPE_TONE` map assigns success/warning/danger/default to each known event type; rendered as a colored dot left of each row for at-a-glance scanning.
- **Hand-written summaries**: `summaryFor(entry)` switches on `entry.type` and formats the discriminating fields into a one-line human summary. Falls back to `entry.type` for unknown types so future event additions are visible immediately.
- **Filter**: `<select>` populated dynamically from observed event types in the current logs (`Set` → sorted) + `ALL`. Counts shown for `ALL`.
- **Export**: builds a `Blob` of `JSON.stringify(logs, null, 2)`, creates an `<a download>` with date-stamped filename `henry-audit-log-YYYY-MM-DD.json`, programmatically clicks it, revokes the object URL. Success toast on completion, error toast on failure.
- **Clear**: `window.confirm()` gate (cannot be undone) → dispatches `clearAuditLogs` → warning toast with removed count.
- Empty states: distinct messages for "no events ever recorded" vs "no entries match filter".

### 3. `DocumentHubPage.jsx` — Drawer extension
- `drawerTab` state extended: `null | 'compliance' | 'archive' | 'audit'`
- New `openAudit` callback
- Icon-rail gains 📜 button (active when `drawerTab === 'audit'`)
- Drawer header gains 3rd `<button role="tab">Audit</button>`
- Drawer body lazy-renders `<AuditLogPanel/>` only when active

### 4. `app.css` (~70 lines appended)
- `.audit-panel__toolbar` (filter/count/export/clear), `.audit-panel__btn` (+ `--danger` variant for Clear), `.audit-panel__empty`
- `.audit-list__row` with left-border dashed separator, `.audit-list__dot` (8×8 colored circle), `.audit-list__type` (monospace event-type chip), `.audit-list__time` (tabular-nums), `.audit-list__summary`
- All values reference existing design tokens (`--color-border`, `--color-text-muted`, `--radius-sm`, `--fs-xs`, etc.)

## Validation
- `get_errors` clean on `auditSlice.js`, `AuditLogPanel.jsx`, `DocumentHubPage.jsx`
- `npm run build` → ✅ 6.42s, 0 warnings, CSS 33.83 kB (was 31.64 kB; +2.19 kB for audit panel + earlier user CSS edits)

## Decisions
| Decision | Rationale |
|----------|-----------|
| Group by day, newest day open | Matches the mental model: "what happened today?" is the most common question. The Map-based bucketing preserves the slice's existing reverse-chronological order within each day. |
| Hand-written `summaryFor` per type instead of generic JSON | Audit entries have wildly different shapes; a one-size summary would be either too verbose (full JSON) or too useless (`Type: PDF_GENERATED`). Hand-written formatters are 5 minutes each and infinitely more scannable. |
| Filter from observed types, not from a hard-coded enum | Future event types appear automatically without code changes. Sorted alphabetically for predictability. |
| `window.confirm` for Clear, not a custom modal | The Clear action is rare and destructive; native confirm is unmissable, accessible, and keyboard-default-cancels. Custom modal would be overkill. |
| Export as JSON, not CSV | Audit entries are heterogeneous (different fields per type); JSON preserves all detail without schema gymnastics. Users can pipe to `jq` or import to spreadsheet via Power Query. |
| Tone dot rather than full row tinting | A 100-entry colored list becomes wallpaper. The dot is visible but doesn't dominate the layout. |

## Risks
- **Cap of 100 entries** (existing) means heavy-use sessions silently lose history beyond 100. Export gives users an escape valve. If this becomes a complaint, raise the cap or add IndexedDB persistence.
- **Localized day labels** depend on browser locale; an export consumed in another timezone could show different bucketing. Acceptable since the underlying ISO timestamp is preserved in the JSON.
- **Clear is irreversible** — there's no undo. The `confirm()` is the only safety. Future could add a 5-second toast with Undo, but that requires staging logs in slice state and is over-engineering for now.

## Tracker Updates
- Progress: **14/14 → 15/15 (100%)**
- New row: T-15 added under ✅ Done
- Validation log: Session 20 build entry

## Files Touched
- `src/store/auditSlice.js` (+`clearAuditLogs` reducer)
- `src/components/AuditLogPanel.jsx` (NEW)
- `src/components/DocumentHubPage.jsx` (3rd drawer tab + icon-rail button + lazy-render)
- `src/styles/app.css` (+~70 lines audit panel styles)
- `plans/implementation/IMPLEMENTATION_TRACKER.md` (T-15 row + validation log)

## Deferred (handoff)
- Persist audit log to IndexedDB or backend (requires schema decision)
- "Restore from JSON" import (inverse of export) — only useful if user clears by mistake
- Per-entry detail expansion (raw JSON preview) — currently summary-only
- Undo toast on Clear (5s window)
