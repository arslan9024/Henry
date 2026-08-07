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

### Phase A — Builder navigation quality
- Auto-return to Tenancy Builder after successful extractor save
- Deep-link into missing gate requirements
- Preselect ownerTag when launched from builder step context

### Phase B — Autofill expansion
- Apply more title deed fields automatically
- Add passport/visa extraction support if needed
- Sync extracted values into more tenant/landlord fields

### Phase C — PDF output maturity
- Complete merged PDF generation engine
- Add static coordinate mapping editor
- Add fillable PDF field editor

### Phase D — Audit and traceability
- Show which source document populated each field
- Add audit log timeline of uploads/applies/generation
- Add validation dashboard for incomplete records

### Phase E — Team-scale upgrades
- Cloud storage/back-end persistence layer
- Role-based access and approval flow
- Versioned template profiles

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
