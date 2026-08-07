# Module Vision

**Last updated:** 2026-08-07  
**Owner:** Product / Operations vision for Henry tenancy workflows

---

## Vision Statement

Build a **document-driven tenancy contract generation system** where the user can prepare a tenancy contract step by step using trusted source documents instead of manual retyping.

The module should:
- collect landlord data first,
- collect property data from title deed,
- collect tenant identity data from Emirates ID,
- collect tenant supporting documents like passport and visa,
- enforce business-critical blocking requirements,
- and only then allow tenancy contract autofill and final PDF generation.

---

## Core Experience

### Guided workflow
The desired operating sequence is:
1. **Landlord details first**
2. **Property details**
3. **Tenant details**
4. **Contract details**
5. **Additional terms**
6. **Addendum**
7. **Generate/download/save final output**

### Trusted-source autofill
The system should learn from uploaded documents and reuse those values to autofill future contracts.

### Copy-safe editing
Uploaded templates are preserved as master copies, while active editing always happens on a working copy.

---

## Business Intent Behind the Module

This is not just a form builder.
It is intended to become a **document operations workflow** where:
- source documents are captured once,
- structured knowledge is extracted,
- business rules are enforced before generation,
- and the output is reliable enough for operational use.

---

## Non-Negotiable Principles

1. **Hard gates before generation**
   - Missing critical docs or contact info must block progress.
2. **Owner-tagged identity records**
   - Emirates ID uploads must be tagged as `tenant` or `landlord`.
3. **Reference preservation**
   - Uploaded documents must be stored for future autofill learning.
4. **Audit-friendly workflow**
   - The system should always make it clear what source documents informed the contract.
5. **Upgrade-ready design**
   - The module should remain extensible for future integrations and automation.

---

## Success Criteria

This module is successful when a team member can:
- upload landlord and tenant supporting documents,
- satisfy all required gates,
- apply extracted values to the tenancy workflow,
- and generate a tenancy package with far less manual entry and fewer mistakes.
