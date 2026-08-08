# Future Upgrades

**Last updated:** 2026-08-07

---

## Current implemented foundations
- Dedicated Tenancy Contract Builder route
- Title Deed extraction module
- Emirates ID extraction module
- Hard-gated landlord and tenant onboarding steps
- Saved reference knowledge for future autofill
- Template master/working-copy handling

---

## Recommended next upgrades

### Phase A — Builder navigation quality ✅ Complete (2026-08-08)
- [x] Auto-return to Tenancy Builder after successful extractor reference save
- [x] Deep-link into title deed, landlord/tenant Emirates ID, passport, and residence-permit requirements
- [x] Preselect Emirates ID `ownerTag` and tenant identity `documentType` from validated builder context

**Evidence:** validated `appRoute.context` contract, contextual builder CTAs, extractor preselection/return
behavior, `extractorRouteContext.test.jsx`, and full suite at 141 files / 2,460 tests.

### Phase B — Autofill expansion ✅ Complete (2026-08-08)
- [x] Apply full supported title deed property, ownership, registration, mortgage, purchase, and certificate metadata
- [x] Apply passport and residence-permit fields through a shared normalized mapping service
- [x] Sync richer Emirates ID identity/employment metadata into tenant and landlord records
- [x] Expose expanded autofill values in Tenancy Builder for review and correction

**Evidence:** `extractionAutofillService.js` + unit tests, expanded guarded document schema, shared
mapping across extractor journeys/builder shortcuts/inline scans, lint clean, and full suite at 142 files /
2,464 tests.

### Phase C — PDF output maturity ✅ Complete (2026-08-08)
- [x] Complete merged PDF generation engine with ordered-page validation and actionable failures
- [x] Add bilingual static coordinate mapping editor with persisted working-copy profiles
- [x] Add fillable PDF field editor with AcroForm discovery and field population
- [x] Render selected custom templates in separate and merged export journeys
- [x] Keep master templates read-only and preserve generated-template fallback

**Evidence:** `templatePdfService.js`, `TemplateMappingEditor.jsx`, safe persisted binary retrieval,
profile persistence tests, hardened `mergePdfBlobs.js`, lint clean, and full suite at 146 files /
2,475 tests with production build pass.

### Phase D — Audit and traceability ✅ Complete (2026-08-08)
- [x] Show source ID, type, file, path, and apply time for populated fields
- [x] Add audit timeline events for source uploads, field applies, and PDF generation
- [x] Add searchable/filterable validation dashboard for active records and archived artifacts
- [x] Persist provenance locally and preserve exact source references across extractor journeys

**Evidence:** `fieldSourceSlice.js`, builder provenance rail, normalized extractor audit events,
`ValidationDashboardPage.jsx`, route/store integration, lint clean, and full suite at 148 files /
2,479 tests with production build pass.

### Phase E — Team-scale upgrades ✅ Complete (2026-08-08)
- [x] Provider-neutral persistence with local back-end fallback and Firebase Storage adapter
- [x] Firebase Auth REST boundary with custom-claim role normalization
- [x] Operator → Manager → Admin permission matrix and enforced approval transitions
- [x] Team Workflow console for identity, approval queue, storage readiness, and template versions
- [x] Immutable named template profiles with working-copy rollback
- [x] Environment-only cloud configuration with no committed credentials

**Deployment boundary:** local persistence works without configuration. Firebase storage/auth activate when the
deployment supplies the values in `.env.example` and a short-lived runtime token. No production secret is
stored in source control.

**Evidence:** `cloudPersistenceService.js`, `firebaseAuthService.js`, `userAccessSlice.js`,
`approvalSlice.js`, `TeamWorkflowPage.jsx`, version/rollback contracts in `templateStore.js`, lint clean,
and full suite at 151 files / 2,486 tests with production build pass.

---

## Guardrails
- Do not remove hard business gates without explicit policy approval.
- Do not stop requiring Emirates ID owner tags.
- Do not allow master template editing directly.
- Keep source document preservation as a first-class rule.

---

## Non-goals for current phase
- Full cloud document management
- Signature capture platform
- Full OCR extraction for every possible tenant support document
- Enterprise workflow orchestration beyond current scope

These items are no longer an ambiguous “next phase.” Candidate value, estimates, dependencies, risks, and decision gates are groomed in `plans/roadmap/PHASE_F_CANDIDATES.md`; none is authorized until Product and Engineering record a selection.
