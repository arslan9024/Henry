# Henry End-to-End Test Plan

**Status:** Execution plan complete; harness implementation is a Phase F candidate

**Primary tool:** Playwright

**Targets:** Local records mode in CI; Firebase mode in credentialed staging

## 1. Objectives

- Prove critical workflows across real browser, Redux/UI, PDF generation, persistence, audit, provenance, and approval boundaries.
- Validate RBAC with actual Firebase custom claims in staging.
- Detect browser-specific, accessibility, and visual regressions not covered by Vitest/jsdom.
- Keep production PII and credentials out of test fixtures and CI artifacts.

## 2. Test environments

| Environment      | Persistence                                    | Auth                               | Purpose                                    |
| ---------------- | ---------------------------------------------- | ---------------------------------- | ------------------------------------------ |
| CI local         | `scripts/records-server.mjs` temp records root | Local fallback/test doubles        | Deterministic pull-request gate            |
| Staging Firebase | Dedicated staging bucket                       | Three dedicated role users         | Rules, claims, token, and cloud acceptance |
| Production smoke | Production provider                            | Approved synthetic monitor account | Non-destructive availability only          |

## 3. Required fixtures

- Synthetic Title Deed PDF/text fixture.
- Synthetic tenant/landlord Emirates ID images with non-real numbers.
- Synthetic passport and residence permit.
- Static tenancy template and AcroForm tenancy template.
- Operator, Manager, and Admin staging accounts supplied through secret manager.
- Unique case prefix per run; teardown removes only that run's artifacts.

Never commit real identity documents, passwords, ID tokens, or service-account credentials.

## 4. Critical journeys

### E2E-01 — Complete tenancy package

1. Open Tenancy Builder.
2. Upload all required synthetic source documents.
3. Apply extracted data and verify source attribution.
4. Resolve validation gaps.
5. Generate separate and merged PDFs.
6. Assert filenames, page counts/order, download, and persistence event.

### E2E-02 — Operator/Manager approval

1. Sign in as Operator.
2. Submit active record.
3. Assert approve/reject controls are unavailable.
4. Sign out; verify session token cleared.
5. Sign in as Manager.
6. Reject with comment, then approve corrected resubmission.
7. Assert audit/history order and actor IDs.

### E2E-03 — Firebase Storage authorization

1. Assert anonymous upload/read denied.
2. Assert authenticated Operator upload allowed to approved path.
3. Assert forbidden delete/administrative path denied.
4. Expire/revoke token and assert upload fails closed.
5. Reauthenticate and assert recovery.

### E2E-04 — Template mapping and rollback

1. Confirm master is read-only.
2. Create working copy.
3. Configure static coordinates; generate PDF.
4. Detect/map AcroForm fields; generate PDF.
5. Create immutable version.
6. Change mappings and roll back.
7. Assert restored mapping and generated output.

### E2E-05 — Validation dashboard

1. Start incomplete active record.
2. Filter to Incomplete and search by unit/tenant.
3. Assert exact missing requirements.
4. Complete record; assert Ready state.
5. Verify archived artifact status.

### E2E-06 — Persistence degradation

1. Simulate local records API/Firebase network failure.
2. Assert actionable error/toast and no false success.
3. Restore network and retry.
4. Assert one persisted artifact and traceable audit event.

### E2E-07 — Accessibility and responsive smoke

- Keyboard-only navigation through primary routes and dialogs.
- Focus trap/return and background inert behavior.
- Accessible names for upload, mapping, validation, approval, and export controls.
- Viewports: 375, 768, 1024, and 1366 widths.
- Automated accessibility scan with zero critical/serious findings on key pages.

## 5. Browser matrix

| Gate                        | Chromium | Firefox          | WebKit           |
| --------------------------- | -------- | ---------------- | ---------------- |
| Pull request critical flow  | Required | Optional/nightly | Optional/nightly |
| Main/nightly suite          | Required | Required         | Required         |
| Firebase staging acceptance | Required | Required         | Required         |

## 6. Visual regression

Capture stable regions rather than browser PDF viewers:

- Workflow shell and rails.
- Validation dashboard states.
- Team Workflow role/approval states.
- Static/fillable mapping editor forms.
- Toasts, blockers, and modal journeys.

Mask timestamps, generated IDs, file paths, and other nondeterministic content. Store approved baselines using the chosen visual service or Playwright snapshots after business review.

## 7. Reliability and performance criteria

- Critical suite passes 10 consecutive runs without retry-dependent success.
- No test depends on shared mutable records or execution order.
- Per-test unique fixtures and deterministic teardown.
- Critical navigation/action feedback appears within agreed staging SLO; record actual values before setting a hard threshold.
- PDF generation/upload time tracked separately from UI response.

## 8. CI design

1. Install pinned Playwright dependency and browser binaries in a dedicated Phase F change.
2. Build application.
3. Start production records server on an isolated port and temp records directory.
4. Wait on an HTTP health/readiness endpoint (add if absent).
5. Run Chromium critical suite on pull requests.
6. Upload traces/screenshots only on failure with PII-safe fixtures.
7. Run cross-browser/visual suite nightly.
8. Run Firebase project against credentialed protected staging workflow, never forks.

## 9. Exit criteria

- All seven critical journeys automated or explicitly signed off as manual staging-only.
- Zero P0/P1 defects; accepted lower-severity defects have owners/dates.
- Ten-run flake test passes.
- Role/rules denial tests pass in credentialed staging.
- Engineering, QA, Platform, and Business approvals recorded in `plans/deployment/STAGING_CHECKLIST.md`.
