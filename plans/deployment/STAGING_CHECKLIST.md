# Henry Staging Acceptance Checklist

**Applies to:** Phase E release candidate

**Owners:** Engineering, Platform/Ops, QA, Business owner

**Entry gate:** `main` clean, synchronized, and all automated checks green

## 1. Release candidate

- [ ] Record commit SHA and release tag.
- [ ] Confirm `git status --short` is empty.
- [ ] Confirm local `HEAD` equals `origin/main`.
- [ ] Run `npm ci` on a clean staging runner.
- [ ] Run `npm run readiness:check`.
- [ ] Run `npm run lint`.
- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Preserve command logs with the release record.

## 2. Firebase project and web app

- [ ] Dedicated staging Firebase project selected; production data is not used.
- [ ] Web application registered and public configuration copied into the staging secret manager.
- [ ] `VITE_HENRY_STORAGE_PROVIDER=firebase`.
- [ ] API key, auth domain, project ID, and storage bucket configured.
- [ ] `VITE_FIREBASE_STORAGE_TOKEN` is absent.
- [ ] Email/Password auth enabled or approved enterprise identity substitute documented.
- [ ] Staging domain added to Firebase authorized domains.
- [ ] Storage bucket region, retention, lifecycle, and budget alerts approved.
- [ ] `firebase/storage.rules` deployed to the staging bucket.

## 3. Users and custom claims

Create three non-production test users. Assign exactly one role claim to each:

| Account            | Required claim   | Expected access                                    |
| ------------------ | ---------------- | -------------------------------------------------- |
| Operator test user | `role: operator` | Edit, use templates, submit approval, upload       |
| Manager test user  | `role: manager`  | Operator rights, review approvals, create versions |
| Admin test user    | `role: admin`    | Manager rights, override/access administration     |

- [ ] Users must sign out/in after claims change so a fresh ID token is issued.
- [ ] Unknown/missing role claim normalizes to Operator in the client.
- [ ] Server/Storage rules deny anonymous requests regardless of client fallback.

## 4. Critical acceptance journeys

### Journey A — Source to approved tenancy package

- [ ] Operator signs in.
- [ ] Upload Title Deed, landlord Emirates ID, tenant Emirates ID, passport, and residence permit.
- [ ] Apply extracted values and verify field provenance shows source file/type/time.
- [ ] Resolve all validation dashboard gaps.
- [ ] Generate separate tenancy/addendum PDFs.
- [ ] Generate merged package and verify page order/content.
- [ ] Persist output to configured Firebase bucket.
- [ ] Submit active record for approval.
- [ ] Manager approves and audit timeline records submission/review/generation.

### Journey B — Rejection and resubmission

- [ ] Manager rejects a submitted record.
- [ ] Operator corrects the record and resubmits.
- [ ] History retains both rejection and resubmission events.
- [ ] Manager approves corrected record.

### Journey C — Template safety and rollback

- [ ] Master template cannot be edited.
- [ ] Working copy accepts static or AcroForm mappings.
- [ ] Manager creates immutable named version.
- [ ] Working copy changes after version creation.
- [ ] Rollback restores versioned mappings.
- [ ] Regenerated PDF matches approved version.

### Journey D — Access denial

- [ ] Anonymous Storage read/write denied.
- [ ] Operator cannot perform Manager approval.
- [ ] Operator cannot create or roll back template versions.
- [ ] Expired token upload fails without falling back to unauthenticated cloud access.
- [ ] Forbidden path/delete operation is denied and visible to the operator.

## 5. Quality and operational targets

| Metric                 | Acceptance target                                                             |
| ---------------------- | ----------------------------------------------------------------------------- |
| Automated regression   | 100% passing                                                                  |
| Critical E2E journeys  | 100% passing in Chromium; no critical failures in Firefox/WebKit when enabled |
| Repeated-run stability | 10 consecutive critical-flow runs without flake                               |
| Readiness check        | Exit code 0                                                                   |
| Client console         | No unhandled errors during acceptance                                         |
| PDF output             | Required values present; merged pages in approved order                       |
| Unauthorized access    | 100% denied                                                                   |
| Audit/provenance       | Every upload/apply/generation/approval event traceable                        |

## 6. Data protection and operations

- [ ] Staging test data contains no real identity documents or production PII.
- [ ] Bucket CORS and security rules restricted to approved origins/access patterns.
- [ ] Backup and restore procedure exercised on a non-production artifact.
- [ ] Retention/deletion policy verified.
- [ ] Monitoring, alert recipients, and incident owner assigned.
- [ ] Rollback commit/tag and previous deployment artifact identified.

## 7. Sign-off

| Area                    | Approver         | Result  | Date/evidence |
| ----------------------- | ---------------- | ------- | ------------- |
| Engineering checks      | Engineering lead | Pending |               |
| Firebase/security       | Platform owner   | Pending |               |
| Critical journeys       | QA lead          | Pending |               |
| Workflow/PDF acceptance | Business owner   | Pending |               |
| Release authorization   | Release manager  | Pending |               |

Production promotion is blocked until all five sign-offs are recorded.
