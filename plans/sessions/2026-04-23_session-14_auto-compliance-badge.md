# Session 14 — Auto-Compliance Badge in Preview Toolbar

## Session Header
- **Date:** 2026-04-23
- **Session #:** 14
- **Operator:** Henry (AI Record Keeper)
- **Goal (1 sentence):** Surface a live RERA/DLD compliance status pill next to the Compliance Check button so users see outstanding warnings without having to click.

## Scope (in)
- `useMemo` live evaluator running `evaluateCompliance` on every doc/template change
- Three-tone badge (clear / important / critical) with accessible aria-label
- Tooltip describing the breakdown
- CSS pill matching the existing toolbar visual language

## Out of Scope
- Auto-dispatching warnings to Redux on every edit (would spam the audit log — explicit Check button keeps that single source of truth)
- Per-rule deep-link from the badge (defer to v2)
- Animations on tone change

## Plan
1. Add `useMemo`-cached evaluator to `DocumentHubPage.jsx`
2. Render `<span class="compliance-badge">` between the toolbar buttons
3. Refactor `handleComplianceCheck` to reuse the cached `liveWarnings`
4. Append three-tone CSS pill styles to `app.css`
5. Validate + tracker

## Work Log
| Time | Action | Files Touched | Result |
|------|--------|---------------|--------|
| — | Live evaluator + badge JSX | `src/components/DocumentHubPage.jsx` | Re-uses cached `liveWarnings` for both badge + audit log payload; aria-live polite |
| — | Pill CSS | `src/styles/app.css` | `.compliance-badge--clear/important/critical` pills using existing palette |
| — | Tracker | `plans/implementation/IMPLEMENTATION_TRACKER.md` | T-09 row, 9/9, validation log entry |

## Validation
| Check | Command | Outcome |
|-------|---------|---------|
| Diagnostics | `get_errors` on DocumentHubPage.jsx | ✅ Clean |
| Build | `npm run build` | ✅ 316 modules, 5.85 s |

## Decisions Made
- **Live evaluator memoised on `[activeTemplate, documentData]`** — rules are cheap boolean reads, so recomputing on every edit costs sub-ms.
- **No auto-dispatch to Redux** — the explicit Compliance Check button remains the only thing that writes warnings into the slice and emits an audit log entry. The badge is read-only / advisory. Keeps the audit trail clean.
- **Three tones, no fourth "loading" tone** — `evaluateCompliance` is synchronous, so a transient state isn't possible.
- **Tooltip carries the precise breakdown** (`X critical, Y important — click Compliance Check for details`); badge text stays terse.
- **Aria-label** explicitly says "Compliance status: …" for screen readers.

## Risks / Follow-ups
- If we ever add expensive rules (network calls, fuzzy matching), the memo dependency on `documentData` will start firing more work — at that point promote evaluation to a debounced selector.
- Badge does not yet expand to show warning details on hover/click; could become a popover in a future iteration.
- Knowledge-base rules are evaluated alongside legacy switch rules — no change here, but worth noting that adding a new KB rule will automatically reflect in the badge.

## Tracker Updates Applied
- [x] Added **T-09** row to **Done** in `IMPLEMENTATION_TRACKER.md`
- [x] Updated `Progress: 9/9 tasks complete (100%)` and `Last Updated: 2026-04-23`
- [x] Appended Validation Log row (`316 modules, 5.85 s`)

## Next Session Handoff
- Consider promoting the badge to a popover that lists the top 3 outstanding warnings inline.
- When tone goes critical, optionally pulse-animate the badge once to draw attention (single keyframe, no infinite loop).
- Wire the badge into the `FooterActionBar` Generate PDF button — currently the button doesn't visually reflect critical state.
