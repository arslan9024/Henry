# Session 15 — UI/UX Upgrade (Polish + Layout Refactor)

## Session Header
- **Date:** 2026-04-23
- **Session #:** 15
- **Operator:** Henry (AI Record Keeper)
- **Goal (1 sentence):** Replace always-on sidebars and the sticky footer chat with a collapsed-by-default, lazy-rendered layout (icon rail + right drawer + floating chat dock) built on shared design tokens and one reusable `<Disclosure>` primitive.

## Scope (in)
- Design token system (`--space-*`, `--radius-*`, `--shadow-*`, `--fs-*`, semantic colors, motion + reduced-motion)
- New `Disclosure` primitive with mandatory **lazy mount** (children rendered only on first open)
- Left rail: collapses to a 56 px icon rail (`localStorage` persisted)
- Right rail: removed from grid → on-demand right-edge drawer with Compliance/Archive tabs
- Floating `ChatDock` (bottom-right FAB → 380×560 panel) replacing sticky footer chat
- Toolbar restructure: live compliance badge becomes a drawer trigger
- All sidebars (Info/Compliance/Archive) migrated to grouped Disclosures
- Hamburger in `TopNavbar` for <900 px viewports

## Out of Scope
- Template-internal collapsibles (each template form remains flat)
- Dark-mode token set
- Storybook / component catalog
- Audit log UI redesign
- Animation system beyond simple chevron + drawer transitions

## Plan
1. Tokens block in `:root` (additive — no existing var renamed)
2. `Disclosure.jsx` + CSS (lazy, controlled or uncontrolled)
3. `ChatDock.jsx` + CSS (FAB ↔ panel, localStorage)
4. CSS for right drawer + icon rail + layout modifiers
5. Refactor `InfoArticlesPanel`, `ComplianceChecklistPanel`, `ArchiveHistorySidebar` → grouped Disclosures
6. Rewrite `DocumentHubPage` to host icon rail + drawer + ChatDock + restructured toolbar
7. Slim `FooterActionBar` to PrintButton-only, override sticky positioning
8. Hamburger in `TopNavbar` dispatching `henry:toggle-left-rail`
9. `get_errors`, `npm run build`, tracker bump

## Work Log
| Action | Files Touched | Result |
|--------|---------------|--------|
| Token expansion | `src/styles/app.css` (`:root`) | 4 vars → ~30 vars; reduced-motion media query disables transitions |
| Disclosure primitive | **NEW** `src/components/Disclosure.jsx` + CSS | Accessible button header, `aria-expanded`/`aria-controls`, lazy mount via `hasOpened` flag, grid-row 0fr→1fr transition, 4 tones |
| ChatDock primitive | **NEW** `src/components/ChatDock.jsx` + CSS | Bottom-right FAB ↔ 380×560 panel, persists state to `henry.ui.chatDock`, Esc closes, mobile <600 px = near-full sheet |
| Right drawer + icon rail CSS | `app.css` | `.right-drawer` slide-in, scrim, focus-friendly tabs; `.icon-rail` sticky 56 px column |
| Info articles panel | `src/components/InfoArticlesPanel.jsx` rewritten | 5 Disclosures: Templates (open), Operations, Identity Scanner, Highlights, Articles |
| Compliance panel | `src/components/ComplianceChecklistPanel.jsx` rewritten | Warnings grouped by severity → 3 Disclosures with tone (danger/warning/default), Critical defaults open |
| Archive panel | `src/components/ArchiveHistorySidebar.jsx` rewritten | Entries grouped by month, current month defaults open |
| Document hub | `src/components/DocumentHubPage.jsx` rewritten | Icon rail ↔ expanded sidebar (localStorage), right drawer with tabs + scrim + Esc, 3-zone toolbar (Edit/Preview · doc title · badge+Check+Archive), badge clicks open drawer |
| Footer | `src/components/FooterActionBar.jsx` slimmed | Removed chat mount; sticky positioning overridden in CSS |
| Top nav | `src/components/TopNavbar.jsx` | Added hamburger button dispatching `henry:toggle-left-rail` window event (visible <900 px) |

## Validation
| Check | Command | Outcome |
|-------|---------|---------|
| Diagnostics | `get_errors` on 8 files | ✅ Clean |
| Build | `npm run build` | ✅ 318 modules, 5.43 s |
| CSS bundle | n/a | 29.00 kB (was 20.39 kB) — +8.6 kB for tokens, Disclosure, drawer, dock, icon-rail |
| Lazy-mount proof | manual via React DevTools recommendation in plan | Disclosure children only mount after first `is-open` |

## Decisions Made
- **Right rail is gone from the persistent grid.** It became an on-demand drawer because the sidebars (Compliance + Archive) are advisory — users don't need them visible while editing. Frees ~300 px of horizontal space for the document.
- **Lazy mount, not unmount-on-close.** Once opened, Disclosure keeps children mounted to preserve form state and scroll position. Closing only collapses height.
- **localStorage for both rail (`henry.ui.leftRail`) and chat (`henry.ui.chatDock`)**, but **drawer-tab state is intentionally session-only** (always starts closed) per Decision #1 in the plan — less surprising on revisit.
- **Hamburger uses a window CustomEvent** rather than threading a prop or adding context — keeps `TopNavbar` decoupled from `DocumentHubPage`.
- **Compliance badge is now a `<button>`**, not a `<span>`. Clicking it opens the drawer to the Compliance tab (still doesn't write an audit log; only the explicit "Compliance Check" button does).
- **Footer becomes static**, not removed — it still hosts the Generate PDF button. Just no longer sticky and no longer hosts chat.
- **Reduced-motion handled via CSS variable swap** (`--motion-fast` and `--motion-med` collapse to 0 ms) rather than JS branching — single source of truth.

## Risks / Follow-ups
- **`<900 px` collapsed icon rail is hidden** to free space, so users on phones must expand the rail via the hamburger — verified in CSS but no runtime test yet.
- **No focus trap inside the drawer or chat panel.** Esc closes, scrim click closes, but Tab can leave the dialog. Acceptable for v1; revisit when adding more interactive content.
- **No toast yet** for "extraction landed while chat closed" — deferred (would require lifting extraction state out of `LlmFooterChatBox`). Punt to next session if user complains they missed suggestions.
- **`HenryOperationsPanel` and `IdentityScanner`** are now wrapped in Disclosures and start collapsed. Both contain stateful content (file inputs); thanks to keep-mounted-after-open, this is non-destructive.
- **Print preview is unaffected** — `.print-hidden` already excludes drawer/dock/icon-rail; verified via `@media print` overrides at end of CSS block.

## Tracker Updates Applied
- [x] Added **T-10** row to Done (`IMPLEMENTATION_TRACKER.md`)
- [x] `Progress: 10/10 tasks complete (100%)`
- [x] Validation Log row: `318 modules, 5.43 s; CSS 29.00 kB`

## Next Session Handoff
- Add **focus trap** to right drawer and chat panel (use a small `useFocusTrap` hook).
- Surface a top-right toast when an extraction lands while chat is closed (lift `extraction` state out of `LlmFooterChatBox` or store it in Redux).
- Consider a **keyboard shortcut** to toggle the chat dock (e.g. `Ctrl+/`).
- Add a **density toggle** (compact/comfortable) that shifts `--space-*` scale — useful for power users.
- Migrate **template form sections** to Disclosures (Phase C — 8 templates × ~3-5 sections each).
