# Phase E Production Readiness

**Status:** Implementation complete; deployment configuration required per environment  
**Verified:** 2026-08-08  
**Owner:** Henry operations / deployment administrator

## 1. Release baseline

- Branch: `main`
- Phase E implementation commit: `012d954`
- Storage: provider-neutral adapter (`local` or `firebase`)
- Identity: Firebase Identity Toolkit REST boundary with local fallback role
- Roles: Operator → Manager → Admin
- Workflow: submit, approve/reject, resubmit, audit events
- Templates: immutable named versions with working-copy rollback
- Last complete verification baseline: 152 test files / 2,491 tests, readiness gate + lint clean, production build pass

## 2. Environment configuration

Copy `.env.example` to a deployment-managed environment file. Never commit the populated file.

Validate the selected provider before build/deployment:

```powershell
npm run readiness:check
```

The command exits non-zero for unknown providers, incomplete Firebase public configuration, or any
`VITE_FIREBASE_STORAGE_TOKEN` value. Local mode passes with a warning that TLS/authenticated reverse proxy
remain infrastructure requirements.

| Variable                       | Required         | Purpose                          |
| ------------------------------ | ---------------- | -------------------------------- |
| `VITE_HENRY_STORAGE_PROVIDER`  | Yes              | `local` or `firebase`            |
| `VITE_FIREBASE_API_KEY`        | Firebase auth    | Firebase public web API key      |
| `VITE_FIREBASE_AUTH_DOMAIN`    | Firebase auth    | Authorized authentication domain |
| `VITE_FIREBASE_PROJECT_ID`     | Firebase         | Project identifier               |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage | Target object bucket             |

Firebase bearer tokens are **not** environment variables. `signInWithFirebasePassword` stores the short-lived ID token only in module-scoped runtime memory for authenticated Storage calls. Normalized Redux user objects contain identity and role, not credentials.

## 3. Firebase setup checklist

- [ ] Create/choose the Firebase project and web application.
- [ ] Enable Email/Password authentication or replace the REST sign-in boundary with the approved enterprise provider.
- [ ] Add custom role claims: `operator`, `manager`, or `admin`.
- [ ] Configure authorized domains for each deployment environment.
- [ ] Create the Storage bucket and lifecycle/retention policy.
- [ ] Deploy Storage rules that require authentication and authorize paths by role/tenant.
- [ ] Populate deployment environment variables from `.env.example`.
- [ ] Confirm sign-out invokes `signOutFirebaseSession()` to clear the in-memory token.
- [ ] Verify upload, download, expired-token, forbidden-path, and offline behavior in staging.

## 4. Local/production records server

For filesystem-backed deployment:

```powershell
npm install
npm run build
npm run serve:prod
```

The production server exposes:

- `GET /api/records/archive`
- `POST /api/records/archive`
- `POST /api/records/file`
- `GET /api/records/file?path=...`

File reads and writes are constrained to the repository `records/` root. Run the service behind TLS and an authenticated reverse proxy; the zero-dependency server does not terminate TLS or provide enterprise identity middleware itself.

## 5. RBAC and approval operating procedure

| Role     | Minimum capabilities                                              |
| -------- | ----------------------------------------------------------------- |
| Operator | Edit records, use templates, submit approval                      |
| Manager  | Operator capabilities plus review and template version creation   |
| Admin    | Manager capabilities plus approval override and access management |

1. Operator completes validation and submits the active record.
2. Manager reviews source provenance, validation gaps, and generated output.
3. Manager approves or rejects with a comment.
4. Rejected work is corrected and resubmitted; every transition remains in the request history and audit timeline.
5. Admin override is reserved for documented operational exceptions.

## 6. Template version and rollback procedure

1. Work only from a template working copy; masters remain read-only.
2. Save and validate static coordinates or AcroForm mappings.
3. Manager/Admin creates an immutable named profile version (for example `Standard`, `Corporate`, or `Military`).
4. Generate a staging PDF and compare it to the approved source.
5. If regression occurs, select the immutable version and roll the working copy back.
6. Re-run PDF generation and approval before release.

## 7. Release gates

```powershell
npm run lint
npm test
npm run build
npm run readiness:check
```

- [ ] Commands pass on the release commit.
- [ ] `git status --short` is empty.
- [ ] `HEAD` equals the deployed commit.
- [ ] Environment secrets are supplied by the hosting platform.
- [ ] Firebase rules and custom claims are tested with all three roles.
- [ ] Critical tenancy flow is exercised: upload → apply → provenance → validate → generate → approve → persist.
- [ ] Template version creation and rollback are exercised.
- [ ] Backup, retention, restore, monitoring, and incident ownership are assigned.

## 8. Known non-blocking items

- Vite reports the established large main-chunk and ineffective dynamic-import warnings; builds pass. Plan code-splitting as a performance phase rather than mixing it into deployment configuration.
- Firebase production activation requires project values, security rules, users/custom claims, and hosting secrets that cannot be committed to this repository.
- The local records server is suitable behind an authenticated reverse proxy; direct public exposure is not recommended.

## 9. Sign-off

| Area                   | Owner                  | Status                     |
| ---------------------- | ---------------------- | -------------------------- |
| Code verification      | Engineering            | Ready                      |
| Firebase project/rules | Platform administrator | Pending environment setup  |
| Role assignments       | Business owner         | Pending deployment roster  |
| Backup/retention       | Operations             | Pending deployment policy  |
| Production release     | Release manager        | Pending staging acceptance |
