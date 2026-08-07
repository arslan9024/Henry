# Henry Module Knowledge Vault

**Last updated:** 2026-08-07  
**Purpose:** Consolidated source of truth for the tenancy contract generation ecosystem, including user vision, mandatory business rules, extraction knowledge, architecture, and future upgrade roadmap.

---

## Documentation Index

### 1. Vision
- [`vision/MODULE_VISION.md`](./vision/MODULE_VISION.md)
  - High-level product vision
  - Why this module exists
  - What success looks like

### 2. Requirements
- [`requirements/MANDATORY_GATES.md`](./requirements/MANDATORY_GATES.md)
  - Step 1 landlord hard gate
  - Step 2 tenant hard gate
  - Autofill/export blocking policy
- [`requirements/DOCUMENT_UPLOAD_MATRIX.md`](./requirements/DOCUMENT_UPLOAD_MATRIX.md)
  - Which documents are required
  - Who they belong to
  - Where they are stored
  - What each one unlocks

### 3. Knowledge
- [`knowledge/TENANCY_AUTOFILL_KNOWLEDGE.md`](./knowledge/TENANCY_AUTOFILL_KNOWLEDGE.md)
  - Tenancy contract template knowledge
  - Autofill fields and readiness logic
- [`knowledge/TITLE_DEED_EXTRACTION_KNOWLEDGE.md`](./knowledge/TITLE_DEED_EXTRACTION_KNOWLEDGE.md)
  - Title deed extraction rules and numbered scan items
- [`knowledge/EMIRATES_ID_EXTRACTION_KNOWLEDGE.md`](./knowledge/EMIRATES_ID_EXTRACTION_KNOWLEDGE.md)
  - Emirates ID extraction rules, owner-tag policy, OCR behavior
- [`knowledge/TENANT_IDENTITY_EXTRACTION_KNOWLEDGE.md`](./knowledge/TENANT_IDENTITY_EXTRACTION_KNOWLEDGE.md)
  - Passport and residence-permit extraction rules, readiness logic, storage policy

### 4. Architecture
- [`architecture/MODULE_INTERACTIONS.md`](./architecture/MODULE_INTERACTIONS.md)
  - How Tenancy Builder, Title Deed, Emirates ID, and Tenant Identity modules work together
  - State + reference flow
  - Upload → extract → apply → generate lifecycle

### 5. Roadmap
- [`roadmap/FUTURE_UPGRADES.md`](./roadmap/FUTURE_UPGRADES.md)
  - Planned upgrades and integration path
  - Guardrails and non-goals

---

## Existing Rule Docs Kept for Backward Reference

These remain valid and are now complemented by the consolidated docs above:

- [`LANDLORD_STEP1_MANDATORY_RULES.md`](./LANDLORD_STEP1_MANDATORY_RULES.md)
- [`TENANT_STEP2_MANDATORY_RULES.md`](./TENANT_STEP2_MANDATORY_RULES.md)

---

## Update Policy

Whenever the module evolves:

1. **Business rule change** → update `requirements/*`
2. **Parser/extraction change** → update `knowledge/*`
3. **Workflow/routing change** → update `architecture/*`
4. **Vision or scope change** → update `vision/*` and `roadmap/*`

This folder should stay aligned with code so future upgrades remain safe and intentional.
