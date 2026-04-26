# Session 19 — Global Toast System + Build Cleanup

**Date:** 2026-04-23  
**Tracker Task:** T-14  
**Status:** ✅ Shipped  
**Build:** Green (Vite 5.4.21, 6.35s, 323 modules, **no warnings**)

---

## Scope
1. Address the long-standing "extraction landed while chat closed" gap by introducing a **global toast surface** so background work always reaches the user.
2. Reuse the toast surface for **PDF generation** and **compliance check** feedback (high-leverage wins for the same plumbing cost).
3. Silence the **PDF chunk-size build warning** — chunk is intentionally large and already lazy-loaded.

## Work Log

### 1. Redux: `src/store/uiSlice.js` (new)
- `toasts: []` ephemeral state (not persisted)
- Actions: `pushToast({ tone, title, body, durationMs })`, `dismissToast(id)`, `clearToasts()`
- `pushToast.prepare` uses `nanoid()` for stable ids; defaults: `tone='info'`, `durationMs=5000`
- Selector: `selectToasts`
- Registered in `store/index.js` as `ui` reducer

### 2. UI: `src/components/ToastHost.jsx` (new)
- `ToastItem` owns its own `setTimeout` (not parent) so siblings re-rendering don't reset timers
- `role="alert"` + `aria-live="assertive"` for `error`/`warning` tones; `role="status"` + `aria-live="polite"` otherwise
- Manual close button always available (`Dismiss`)
- Top-right fixed stack, hidden via `@media print`
- Returns `null` when empty (no DOM cost when idle)
- Mounted once in `App.jsx`

### 3. Producers wired
| Site | Trigger | Tone | Body |
|------|---------|------|------|
| `LlmFooterChatBox.handleFileChange` (success, suggestions found) | Extraction succeeds | `success` | "N field(s) extracted — open Ask Henry to review" (7s duration) |
| `LlmFooterChatBox.handleFileChange` (success, no suggestions) | Extraction returns empty | `info` | "No high-confidence fields found in {file}" |
| `PrintButton.handleGeneratePdf` (post-persist) | PDF written | `success` if filesystem persisted, `warning` if download-only | path or fallback message |
| `DocumentHubPage.handleComplianceCheck` | Compliance check run | `error` (critical>0) / `warning` (important>0) / `success` (clear) | issue count or "All checks pass" |

### 4. Vite config: chunk-size warning silenced
```js
build: { chunkSizeWarningLimit: 1600 }
```
Comment in file explains why (PDF chunk lazy-loaded, intentionally large). Build log now clean.

### 5. CSS (~40 lines appended to `app.css`)
- `.toast-host` fixed top-right, gap 8px, max-width 360px / `100vw - 32px`
- `.toast` with `border-left-width: 4px` for tone marker; slide-in animation 180ms
- 4 tone variants: info (#3b82f6) / success (#10b981) / warning (#f59e0b) / error (#ef4444)
- `@media print { .toast-host { display: none !important; } }`

## Validation
- `get_errors` clean across all 8 touched/new files
- `npm run build` → ✅ 6.35s, 323 modules (was 319), CSS 31.64 kB (was 29.37 kB), **no warnings**

## Decisions
| Decision | Rationale |
|----------|-----------|
| Per-toast-row timer (not centralized) | Centralized timer rebuilds when any toast changes — would reset all timers on every push. Per-row mounted-effect is the React-idiomatic way to scope a side-effect to a record. |
| `nanoid` from `@reduxjs/toolkit` (re-export) | No new dependency; RTK already bundles it. Stable ids matter for React `key` and dismiss correctness. |
| Toasts not persisted across reload | A toast is a moment-in-time signal; reviving stale toasts would surprise users and require expiry math. Audit log already captures the durable record. |
| Compliance toast does NOT replace the drawer | Drawer is the canonical surface; toast is the fly-by acknowledgment so users know the click registered + summarizes severity at a glance. |
| `chunkSizeWarningLimit: 1600` instead of `manualChunks` carving | Splitting `@react-pdf/renderer` further provides minimal user benefit (chunk only loads when user clicks Generate PDF) and adds rollup config complexity. The chunk is already optimal for its purpose. |

## Risks
- **Multiple rapid extractions could stack 5+ toasts** — current design grows the column with no cap. If this becomes noisy, add a `MAX_TOASTS = 4` slice in `pushToast.reducer` that drops the oldest.
- **Users on screen-readers may hear assertive toasts twice** if they also have the drawer open with the same content. Acceptable for now; can be tuned per-tone later.
- **Toast tone mapping for compliance is opinionated** (any critical → error). If the user wants a quieter check, add a `silent` opt to `handleComplianceCheck`.

## Tracker Updates
- Progress: **13/13 → 14/14 (100%)**
- New row: T-14 added under ✅ Done
- Validation log: Session 19 build entry

## Files Touched
- `src/store/uiSlice.js` (NEW)
- `src/components/ToastHost.jsx` (NEW)
- `src/store/index.js` (register `ui` reducer)
- `src/App.jsx` (mount `<ToastHost/>`)
- `src/components/LlmFooterChatBox.jsx` (extraction toasts)
- `src/components/PrintButton.jsx` (PDF generation toast)
- `src/components/DocumentHubPage.jsx` (compliance check toast)
- `src/styles/app.css` (+~40 lines toast styles)
- `vite.config.js` (chunkSizeWarningLimit)
- `plans/implementation/IMPLEMENTATION_TRACKER.md` (T-14 row + validation log)

## Deferred (handoff)
- Toast stack cap (`MAX_TOASTS`) — only needed if user reports clutter
- Empirical Ctrl+P print test on all 8 templates (manual; can't be automated)
- Audit-log viewer panel (would benefit from the toast surface for "exported"/"cleared" feedback)
