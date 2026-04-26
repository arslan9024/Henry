# Session 18 — Density Toggle + Ctrl+/ Shortcut + Inert Background

**Date:** 2026-04-23  
**Tracker Task:** T-13  
**Status:** ✅ Shipped  
**Build:** Green (Vite 5.4.21, 5.74s)

---

## Scope
Three small, high-value UX wins from the Session 17 deferred list:
1. **Density toggle** (compact ↔ comfortable, persisted)
2. **`Ctrl+/` global shortcut** to toggle the chat dock
3. **`inert` on background content** while drawer/chat is open (a11y fix for screen-reader virtual cursor escape)

## Work Log

### 1. `src/hooks/useDensity.js` (new)
- Reads `henry.ui.density` from localStorage on mount (defaults to `'comfortable'`)
- Applies value to `document.documentElement.dataset.density`
- Returns `{ density, toggle }`

### 2. `src/hooks/useBackgroundInert.js` (new)
- **Module-scoped** ref-count `activeCount` so multiple concurrent overlays don't fight (drawer + chat both open is supported)
- Each activation increments and re-applies; cleanup decrements and re-applies
- `apply()` walks `document.querySelectorAll('[data-overlay-shield]')` and toggles `inert` + `aria-hidden="true"` (the latter as a fallback for AT that doesn't yet support `inert`)

### 3. `TopNavbar.jsx`
- Imports + uses `useDensity()`
- Header gains `data-overlay-shield` attribute
- New compact `<button class="density-toggle" aria-pressed>` next to "Active Document" label, glyph swaps `▤ Compact` / `▣ Comfortable`

### 4. `ChatDock.jsx`
- Single keydown listener now handles **both** Esc-to-close (only when open) **and** `Ctrl+/` (or `Cmd+/`) global toggle
- Modifier requirement avoids hijacking text-input slashes
- `useBackgroundInert(open)` called

### 5. `DocumentHubPage.jsx`
- `useBackgroundInert(Boolean(drawerTab))` called
- `data-overlay-shield` added to `<section class="hub-content">` and a new wrapper `<div data-overlay-shield>` around `<FooterActionBar/>`

### 6. `app.css` (appended)
- `:root[data-density="compact"]` overrides: tighter `--space-2..6`, smaller `--fs-md`/`--fs-lg`, plus targeted padding overrides for `.disclosure__header`, `.disclosure__body`, `.doc-section`, `.top-navbar`
- `.density-toggle` styles + `aria-pressed="true"` accent state
- `[data-overlay-shield][inert] { pointer-events: none; user-select: none; }` (defensive — `inert` already disables interaction in supporting browsers)

## Validation
- `get_errors` clean on all 5 touched/new files
- `npm run build` → ✅ 5.74s, no warnings beyond pre-existing PDF chunk size

## Decisions
| Decision | Rationale |
|----------|-----------|
| Module-scoped ref-count for `useBackgroundInert` | Cleanest concurrency model; no Redux needed for what's pure DOM state. Survives strict-mode double-invoke because each `useEffect` cycle still nets to zero. |
| `aria-hidden` set alongside `inert` | `inert` is not yet universally supported by all assistive tech (esp. older iOS VoiceOver). `aria-hidden` is the documented fallback. |
| `Ctrl+/` (with modifier) instead of bare `/` | Bare `/` would conflict with users typing in form fields. Modifier-only is the same convention GitHub/Slack use for command palettes. |
| Density compact tightens by 25-33%, not 50% | Aggressive compact makes legal documents feel cramped. The chosen scale stays readable while reclaiming roughly one screen-line per section. |

## Risks
- **`inert` on `<header>` includes the hamburger** — when the drawer is open you can no longer toggle the rail or density. This is intentional (modal modality) but worth noting for users who want to one-handed multitask. Esc still closes the drawer.
- **`Ctrl+/` could conflict with browser dev-shortcuts** in some Linux DEs. We `preventDefault()` the event so user-installed extensions might still misbehave.
- **Density override doesn't touch templates with inline `style={{…}}`** (KeyHandover, parts of OfferLetter). Acceptable: those are PDF-tuned styles, not affected by the chrome density.

## Tracker Updates
- Progress: **12/12 → 13/13 (100%)**
- New row: T-13 added under ✅ Done
- Validation log: 1 new entry for Session 18 build

## Files Touched
- `src/hooks/useBackgroundInert.js` (NEW)
- `src/hooks/useDensity.js` (NEW)
- `src/components/TopNavbar.jsx` (density toggle + shield)
- `src/components/ChatDock.jsx` (inert + Ctrl+/)
- `src/components/DocumentHubPage.jsx` (inert + shield wrappers)
- `src/styles/app.css` (+~30 lines: density overrides, toggle styles, inert defensive rules)
- `plans/implementation/IMPLEMENTATION_TRACKER.md` (T-13 row + validation log)

## Deferred (handoff)
- "Extraction landed while chat closed" toast — still requires lifting `extraction` state into Redux
- Empirical Ctrl+P print-test pass on all 8 templates
- Density preference per-user (would require auth context — out of scope until backend identity exists)
