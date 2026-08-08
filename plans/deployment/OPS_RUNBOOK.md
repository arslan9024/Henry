# Henry Operations Runbook

## 1. Purpose

Deploy, verify, operate, and roll back Henry using either the local records server or Firebase-backed persistence. Never place passwords, bearer tokens, service-account JSON, or populated environment files in Git.

## 2. Prerequisites

- Supported Node.js/npm versions installed on the runner.
- Read access to `arslan9024/Henry` and deployment access to the target environment.
- TLS endpoint and authenticated reverse proxy for local production mode.
- For Firebase mode: project, web app, Auth provider, Storage bucket, deployed rules, custom claims, and hosting secrets.
- Backup/retention owner and incident contact assigned.

## 3. Prepare a release

```powershell
git fetch origin
git checkout main
git pull --ff-only origin main
git status --short
npm ci
npm run readiness:check
npm run lint
npm test
npm run build
```

Stop if any command fails. Record SHA with `git rev-parse HEAD` and retain logs.

## 4. Configure persistence

### Local records mode

Set `VITE_HENRY_STORAGE_PROVIDER=local`, build, then run:

```powershell
npm run serve:prod
```

- Default bind: `0.0.0.0:5000`.
- Override with `PORT` and `HOST` environment variables.
- Put the service behind TLS, authentication, request-size limits, and rate limiting.
- Back up `records/` and test restoration.
- Do not expose `/api/records/*` directly to the public internet.

### Firebase mode

Set deployment-managed values from `.env.example`:

- `VITE_HENRY_STORAGE_PROVIDER=firebase`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`

Do not define `VITE_FIREBASE_STORAGE_TOKEN`; readiness checks intentionally reject it. Auth creates a short-lived token in runtime memory.

Review `firebase/storage.rules`, authenticate the Firebase CLI to the intended project, then deploy through the approved CLI/IaC pipeline:

```powershell
firebase deploy --only storage --project <staging-project-id>
```

The current rules enforce authenticated role access and approved namespaces. Add an organization claim and object-path boundary before multi-organization hosting. Assign role claims with a privileged server-side/admin process, never from the browser.

## 5. Deploy

1. Deploy the immutable `dist/` artifact produced by the verified SHA.
2. Supply environment configuration through the hosting platform.
3. Invalidate CDN cache if applicable.
4. Start/roll the service using the platform's zero-downtime mechanism.
5. Record deployment ID, SHA, operator, start/end time, and configuration version.

## 6. Post-deployment verification

- Open Task Workspace, Tenancy Builder, Validation Dashboard, and Team Workflow.
- Confirm readiness status is Ready for the selected provider.
- Authenticate as Operator, Manager, and Admin test users.
- Execute the critical source → autofill → validation → PDF → approval → persistence flow.
- Download the stored artifact and verify PDF integrity.
- Verify anonymous/unauthorized requests fail.
- Verify audit events and provenance entries appear.
- Check client/server logs, latency, error rate, storage usage, and budget alerts.

## 7. Monitoring and alerts

Monitor at minimum:

- Availability and HTTP 4xx/5xx rates.
- Auth failures and forbidden Storage operations.
- Upload/generation latency and failed persistence count.
- Storage growth, retention jobs, quota, and budget.
- Unhandled browser errors.
- Approval backlog age and rejected/resubmitted volume.

Alert ownership and escalation contacts must be stored in the deployment platform/on-call system, not this public repository.

## 8. Rollback

### Application rollback

1. Pause new deployments; do not delete current records.
2. Select the previous signed/approved SHA and immutable build artifact.
3. Restore the previous environment configuration version if configuration caused the incident.
4. Deploy with the platform rollback command.
5. Re-run readiness and smoke checks.
6. Record incident timeline and affected artifacts.

### Template rollback

Use Team Workflow as Manager/Admin:

1. Select the affected immutable template version.
2. Roll the working copy back.
3. Regenerate a staging PDF.
4. Review and approve before use.

### Data restore

- Local: restore `records/` and `archive-index.json` from the approved backup snapshot.
- Firebase: use the approved bucket/versioning/backup restore process.
- Never overwrite newer production data without an incident owner and data-impact review.

## 9. Troubleshooting

| Symptom                   | Likely cause                         | Action                                                                |
| ------------------------- | ------------------------------------ | --------------------------------------------------------------------- |
| Readiness is Blocked      | Missing/invalid provider config      | Run `npm run readiness:check`; correct listed variables               |
| Forbidden build token     | `VITE_FIREBASE_STORAGE_TOKEN` set    | Remove it; authenticate at runtime                                    |
| Firebase upload 401       | Missing/expired Auth token           | Sign in again; verify Auth provider/domain                            |
| Firebase upload 403       | Storage rules/claim/path denied      | Inspect role claim and deployed rules; do not weaken to public access |
| Local upload HTTP failure | Server/proxy/path/permissions        | Check server logs, records directory permissions, proxy limits        |
| PDF merge failure         | Invalid/corrupt source PDF           | Re-upload source; inspect merge error identifying PDF index           |
| Approval buttons disabled | Current role lacks review permission | Use Manager/Admin account; verify custom claim and refreshed token    |
| Template cannot edit      | Master selected                      | Create/select a working copy                                          |

## 10. Incident closeout

- Confirm service and critical flow restored.
- Preserve logs and affected IDs without copying PII into tickets unnecessarily.
- Document root cause, impact, detection gap, corrective action, and owner.
- Add regression tests or readiness checks for preventable recurrence.
