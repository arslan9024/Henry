# Session 17 — Bulk Template Disclosure Migration + Print Safety

**Date:** 2026-04-23  
**Tracker Task:** T-12  
**Status:** ✅ Shipped  
**Build:** Green (Vite 5.4.21, 6.68s, CSS 29.37 kB)

---

## Scope

Complete the UI/UX upgrade by migrating the 7 remaining templates to grouped `<Disclosure>` sections, matching the reference pattern established by `ViewingFormTemplate` in T-11. Ensure print/PDF output is unaffected by the new collapsible UI.

## Work Log

### 1. Print-safe CSS rule (`src/styles/app.css`)
Appended `@media print { … }` block forcing every disclosure to render expanded when printing:

```css
@media print {
  .disclosure__outer { grid-template-rows: 1fr !important; }
  .disclosure__inner { overflow: visible !important; }
  .disclosure__chevron, .disclosure__badge { display: none !important; }
  .disclosure__header { cursor: default; padding: 0 0 4px 0 !important; }
  .disclosure__body   { padding: 0 !important; border-top: 0 !important; }
  .disclosure        { border: 0 !important; box-shadow: none !important; margin: 0 !important; }
}
```

This is the keystone of the migration — without it, collapsed sections would print as blank space and breaking the document delivery promise.

### 2. Templates rewritten
All 7 follow the same pattern: first section `defaultOpen`, the rest collapsed by default, each with an icon and (where appropriate) a `tone` prop. PDF rendering remains untouched because:
- Final PDFs are produced by `@react-pdf/renderer` via `generateQuotationPdf.js` (separate render path)
- Browser-print (`window.print()`) hits the new `@media print` rule above

| Template | Sections | Default-open | Notes |
|----------|----------|--------------|-------|
| `BookingFormTemplate` | 5 | Property Specifications | Charges in last group; bank details collapsed |
| `GovtEmployeeBookingTemplate` | 3 | Applicant Profile | Government clause uses `tone="warning"` |
| `TenancyContractTemplate` | 3 | Parties | |
| `InvoiceTemplate` | 3 | Issuer + Charges | Two `defaultOpen` to keep totals visible |
| `AddendumTemplate` | 2 | Both open (short doc) | Intro paragraph kept outside Disclosure |
| `OfferLetterTemplate` | 8 | Buyer Information | Conditions & Contingencies uses `tone="warning"` |
| `KeyHandoverMaintenanceTemplate` | 6 | Property & Handover Details | Preserved inline `style={{…}}` luxury styling inside disclosure bodies |

### 3. Diagnostic verification
- `get_errors` clean on all 7 touched files
- `npm run build` → ✅ 6.68s, 0 errors, CSS 29.37 kB (was 29.00 kB; +0.37 kB for print rules)

## Decisions

| Decision | Rationale |
|----------|-----------|
| Display-only templates use `defaultOpen` for the first section only | Matches the user's "collapsed otherwise" preference while keeping the document recognisable when first opened. Power users can collapse anything; PDF output is unaffected. |
| Print rule lives in global `app.css`, not per-component | Single source of truth; future Disclosures get print-safety for free. |
| `OfferLetterTemplate` and `KeyHandoverMaintenanceTemplate` keep their inline `style={{…}}` blocks | These were carefully tuned for `@react-pdf/renderer` style mirroring; rewriting to classes is out of scope and risks regressions in luxury PDF layout. |
| Did not migrate templates to use the `completion()` badge helper from `ViewingFormTemplate` | Display-only templates render Redux state directly — there are no "empty" fields to count in the same sense as a form. Adding fake completion counts would mislead. |

## Risks

- **Browser-print path is unverified empirically** — the print CSS is sound but no human has clicked Ctrl+P on every template post-migration. Recommended manual test before V1.0 sign-off: open each of the 7 templates, collapse some sections, hit Ctrl+P, confirm preview shows everything.
- **Inline `style={{…}}` survival in KeyHandover** — the styles assume the section is rendered; they still are (just inside `<Disclosure>` body), so no functional impact, but future refactors should consolidate to CSS classes.

## Deferred (handoff)

- Density toggle (compact/comfortable) via `data-density` attribute on `<html>`
- `inert` attribute on background content while drawer/chat is open (a11y for SR users on iOS/macOS Safari)
- Global `Ctrl+/` shortcut to toggle the chat dock
- "Extraction landed while chat closed" toast — needs lifting `extraction` state out of `LlmFooterChatBox` (likely into a slice)
- Empirical Ctrl+P print test on all 8 templates (Viewing + the 7 from this session)

## Tracker Updates

- Progress: **11/11 → 12/12 (100%)**
- New row: T-12 added under ✅ Done
- Validation log: 1 new entry for Session 17 build

## Files Touched

- `src/styles/app.css` (+8 lines `@media print` block)
- `src/templates/BookingFormTemplate.jsx` (rewritten)
- `src/templates/GovtEmployeeBookingTemplate.jsx` (rewritten)
- `src/templates/TenancyContractTemplate.jsx` (rewritten)
- `src/templates/InvoiceTemplate.jsx` (rewritten)
- `src/templates/AddendumTemplate.jsx` (rewritten)
- `src/templates/OfferLetterTemplate.jsx` (rewritten)
- `src/templates/KeyHandoverMaintenanceTemplate.jsx` (rewritten)
- `plans/implementation/IMPLEMENTATION_TRACKER.md` (T-12 row + validation log)
