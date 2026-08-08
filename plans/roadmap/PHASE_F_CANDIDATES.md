# Phase F Candidate Roadmap

**Status:** Groomed, not authorized

**Baseline:** Phases A–E complete; production activation awaits external staging acceptance

**Decision owners:** Product owner, Engineering lead, Platform owner, QA lead

Phase F must not begin until Phase E staging gates have owners and production-critical defects are resolved. Estimates are engineering days and require refinement after discovery.

## Prioritization summary

| Rank | Candidate                           |   Estimate | Recommendation                                         |
| ---- | ----------------------------------- | ---------: | ------------------------------------------------------ |
| 1    | E2E and visual regression hardening |  8–12 days | Recommended Phase F foundation                         |
| 2    | Cloud document management           | 15–25 days | Discovery after Firebase staging proof                 |
| 3    | Mobile PWA                          | 12–20 days | Validate field-user demand first                       |
| 4    | Signature capture                   | 20–35 days | Separate compliance/vendor discovery before commitment |

## F1 — E2E and visual regression hardening

Implement a Playwright browser suite for extraction, validation, PDF, approval, template rollback, accessibility, and persistence. Add stable visual snapshots or an approved managed visual service.

**Business value**

- Reduces release risk across the complete document lifecycle.
- Makes role/rules and browser compatibility repeatable.
- Provides objective production-promotion evidence.

**Scope**

- Playwright configuration and synthetic fixtures.
- Local CI server orchestration and critical Chromium gate.
- Nightly Firefox/WebKit and visual suite.
- Protected Firebase staging workflow.
- Accessibility smoke scans and failure traces.

**Dependencies:** CI capacity, staging Firebase project, secret management, stable synthetic PDFs, optional visual-regression vendor.

**Estimate:** 8–12 days.

**Success metrics:** seven critical journeys covered; 10 flake-free runs; zero critical accessibility findings; role denial rules verified.

**Risks:** PDF rendering nondeterminism, secrets on forked CI, test-data cleanup, visual baseline churn.

**Decision:** Recommended first; detailed plan is `plans/testing/E2E_TEST_PLAN.md`.

## F2 — Cloud document management

Add searchable organization and lifecycle management for archived source/generated documents beyond the current persistence adapter. Include metadata indexing, retrieval, authorization boundaries, retention, and auditable deletion.

**Business value**

- Faster retrieval for property/tenant cases.
- Operational controls for retention and duplicate artifacts.
- Foundation for multi-user document collaboration.

**Proposed slices**

1. Discovery: tenancy/organization model, retention, legal holds, search fields.
2. Metadata API/index independent of Storage object listing.
3. Folder/tag/search UI and secured download.
4. Version, restore, deletion approval, and audit.
5. Migration tooling for existing records.

**Dependencies:** accepted Firebase architecture or dedicated backend/database, tenant isolation model, retention/legal policy, monitoring/backups.

**Estimate:** 15–25 days after discovery.

**Success metrics:** authorized artifact retrieval under agreed SLO; 100% tenant isolation tests; retention jobs observable; migration reconciliation complete.

**Risks:** Firebase Storage is not a search database, PII leakage, data migration, regional residency, legal deletion requirements.

**Decision:** Proceed to discovery only after staging proves Auth/Storage/rules.

## F3 — Mobile PWA

Create an installable, resilient mobile shell for field capture and document-status workflows. Prioritize camera upload, draft continuity, validation summary, and approval notifications rather than reproducing every desktop mapping feature.

**Business value**

- Faster source capture at properties/offices.
- Better operator continuity under intermittent connectivity.
- Reduced desktop dependency for approvals and status checks.

**Proposed slices**

1. Field interviews and analytics baseline.
2. Responsive shell/navigation and install manifest.
3. Camera/file capture with compression and safe retry queue.
4. Offline draft metadata and conflict strategy.
5. Mobile accessibility/performance hardening.

**Dependencies:** HTTPS, service worker strategy, device/browser policy, offline encryption decision, upload limits, notification provider if required.

**Estimate:** 12–20 days.

**Success metrics:** core capture at 375px without horizontal overflow; installability audit passes; recoverable interrupted uploads; target Web Vitals agreed and met.

**Risks:** sensitive files in offline caches, iOS limitations, stale drafts/conflicts, camera image quality, scope expansion.

**Decision:** Require field-user demand validation before engineering commitment.

## F4 — Signature capture

Add legally appropriate signatures to approved document packages, preferably through an established e-signature provider. Handwritten canvas capture alone must not be represented as a compliant digital-signature platform.

**Business value**

- Shorter agreement turnaround.
- Better signer status and evidence trail.
- Fewer disconnected manual handoffs.

**Discovery questions**

- Which UAE/Dubai signature and tenancy regulations apply?
- Is simple electronic signature sufficient, or is a trusted digital signature required?
- Are multi-party signing order, witness, OTP, identity verification, and Arabic consent required?
- What evidence package, certificate, retention, residency, and webhook guarantees are mandatory?

**Dependencies:** legal/compliance decision, vendor procurement/security review, server-side integration, webhook verification, immutable evidence storage, signer identity model.

**Estimate:** 5–8 days discovery plus 15–27 days implementation.

**Success metrics:** legal sign-off; tamper-evident signed artifact/evidence; verified webhook replay protection; complete signer audit trail; recovery for declined/expired envelopes.

**Risks:** regulatory invalidity, vendor lock-in/cost, identity fraud, webhook spoof/replay, PII residency, irreversible document mismatch.

**Decision:** Do not implement before legal and vendor discovery.

## Explicitly deferred

- “OCR every possible document” remains out of scope. Add formats only from measured demand and verified sample sets.
- General enterprise workflow orchestration remains out of scope until approval analytics demonstrate the need.
- No production Firebase activation belongs to Phase F; it is the external completion gate for Phase E.

## Decision workshop

Product and engineering should score each candidate from 1–5 on business impact, urgency, confidence, engineering effort, operational burden, and compliance risk. Record:

- selected candidate and minimum scope;
- named product/engineering/platform/QA owners;
- discovery outcomes and architecture decision records;
- budget and target release;
- measurable baseline and release gates.

Until that decision is signed, this file is a candidate backlog—not an implementation commitment.
