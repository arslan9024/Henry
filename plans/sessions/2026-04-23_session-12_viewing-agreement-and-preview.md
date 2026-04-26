# Session 12 — RERA P210 Viewing Agreement, Print Preview & Smart Compliance

## Session Header
- **Date:** 2026-04-23
- **Session #:** 12
- **Operator:** Henry (AI Record Keeper)
- **Goal (1 sentence):** Adopt the official DLD/RERA Property Viewing Agreement (Form P210, Vr.4, Aug 2022) as a first-class template, add a toggleable high-fidelity Print Preview, and wire a Smart Compliance check button backed by RERA Circular 21-2016.

## Scope (in)
- Auto-populating Broker / Tenant / Property fields on the Viewing template
- Faithful 2-page bilingual (EN ⇄ AR) vector PDF renderer matching P210
- Redux-bound editable form with all P210 fields
- Toggleable A4 preview (iframe + `pdf().toBlob()`) using the same render path as final export
- "Compliance Check" CTA that re-evaluates rules, switches sidebar, writes audit log
- Filename pattern `Viewing_Agreement_[Unit]_[Date].pdf`

## Out of Scope
- Arabic OCR for passport/ID cards (existing Emirates ID pipeline reused)
- New print backend (existing T-04 filesystem persistence reused)
- Preview for templates without `supportsPdf` (falls back to edit view)

## Plan
1. Phase A — Data layer: extend `documentSlice` with `broker` + `viewing` sections + DLD extras; update `ALLOWED_FIELDS`; strengthen VIEW-1..6 rules + evaluators
2. Phase B — RERA P210 renderer: `ViewingAgreementPDF.jsx`, `pdfHelpers.buildPdfFileName`, route through `pickPdfComponent`, rewrite `ViewingFormTemplate.jsx`
3. Phase C — `PrintPreview.jsx` component (debounced 300 ms blob + iframe)
4. Phase D — Preview toolbar + Compliance Check button in `DocumentHubPage.jsx`
5. Phase E — CSS, validate, update tracker, create this session doc

## Work Log
| Time | Action | Files Touched | Result |
|------|--------|---------------|--------|
| — | Phase A — data + compliance | `src/store/documentSlice.js`, `src/services/llmService.js`, `src/compliance/ruleCatalog/leasingRules.js`, `src/compliance/ruleEngine.js` | Broker/viewing sections live; VIEW-1..6 enforce RERA Circular 21-2016 |
| — | Phase B — RERA P210 renderer + routing | `src/pdf/ViewingAgreementPDF.jsx` (new), `src/pdf/pdfHelpers.js`, `src/pdf/generateQuotationPdf.js`, `src/templates/registry.js`, `src/templates/ViewingFormTemplate.jsx` | Faithful bilingual 2-page A4; `supportsPdf: true`; filename dispatcher |
| — | Phase C — Print Preview | `src/components/PrintPreview.jsx` (new) | Debounced 300 ms `pdf().toBlob()` → `<iframe>`; leak-safe `revokeObjectURL`; graceful fallback when `supportsPdf` is false |
| — | Phase D — Toolbar + Compliance Check | `src/components/DocumentHubPage.jsx` | Preview toggle + Compliance Check buttons; re-evaluates rules + writes `COMPLIANCE_CHECK_RUN` audit entry + switches sidebar to Compliance tab |
| — | Phase E — Styles + tracker | `src/styles/app.css`, `plans/implementation/IMPLEMENTATION_TRACKER.md` | Toolbar, iframe, viewing form grid styles; tracker bumped 7/7 |

## Validation
| Check | Command | Outcome |
|-------|---------|---------|
| Diagnostics | `get_errors` on all 11 touched files | ✅ Clean on every file |
| Build | `npm run build` | ✅ 312 modules transformed, built in 6.71 s |
| Smoke | Manual — open hub, select Viewing template, toggle preview, click Compliance Check | ✅ Preview iframe renders P210 layout; audit entry appears; sidebar switches to Compliance tab |

## Decisions Made
- **Preview toggle kept in local `useState`** (not Redux) — switching templates should reset the view to edit mode, so persistence is undesirable.
- **PrintPreview uses the exact same render path as Generate PDF** (`generateQuotationPdfBlob`) → eliminates any drift between preview and saved file.
- **Filename dispatcher `buildPdfFileName(templateKey, doc)`** centralizes naming rules; each template contributes a dedicated builder (Ejari, Viewing Agreement, Quotation default).
- **VIEW-3 is a hard critical rule** requiring ORN + BRN + License simultaneously per RERA Circular 21-2016 — intentionally blocks PDF generation without broker credentials.
- **Broker section pre-seeded** with White Caves LLC / License 1388443 / Arslan Malik — reduces friction; overridable at any time.

## Risks / Follow-ups
- `generateQuotationPdf` chunk is 1.49 MB (499 KB gzipped). Acceptable for desktop-only usage; manual chunking is a future optimization.
- Arabic glyph fallback in `@react-pdf/renderer` still uses the default font family — no right-to-left shaping yet. Acceptable because AR text is only section labels; values are Latin.
- Print Preview re-renders the full PDF on any field edit (300 ms debounce). For very large documents this may feel sluggish — reconsider if users complain.
- Compliance Check button currently only runs on click; auto-run on field change is deferred to avoid noise while typing.

## Tracker Updates Applied
- [x] Added **T-07** row to **Done** in `IMPLEMENTATION_TRACKER.md`
- [x] Updated `Progress: 7/7 tasks complete (100%)` and `Last Updated: 2026-04-23`
- [x] Appended Validation Log row (`312 modules, 6.71 s`)
- [x] Next Actions already in sync (maintenance mode)

## Next Session Handoff
- Consider adding an **auto-compliance badge** near the preview toolbar that silently re-evaluates rules on each edit and shows a count of critical warnings (button remains explicit for the audit trail).
- When a Tenant OCR scan is imported, verify that `tenant.passportNo` maps correctly for VIEW-4 satisfaction.
- Investigate code-splitting the `@react-pdf/renderer` chunk further if bundle size becomes a concern.
- Explore applying the same PrintPreview component to the Ejari Tenancy Contract template (currently only Viewing is wired through the toggle).
