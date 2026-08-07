# Emirates ID Extraction Knowledge

**Last updated:** 2026-08-07  
**Source references:** `plans/implementation/EMIRATES_ID_AUTOFILL_REFERENCE.md`, `src/services/emiratesIdExtractionService.js`, `src/pdf/emiratesIdTemplateSchema.json`

---

## Purpose
Emirates ID extraction exists to provide trusted personal identity data for landlord and tenant profiles.

---

## Mandatory owner-tag rule
Every Emirates ID upload must be tagged before saving as one of:
- `tenant`
- `landlord`

This tag controls whether the record satisfies Step 1 or Step 2 gate requirements.

---

## Core extracted fields
1. ID Number
2. Full Name
3. Date of Birth
4. Nationality
5. Issuing Date
6. Expiry Date
7. Sex
8. Card Number
9. Occupation
10. Employer
11. Issuing Place
12. MRZ Line 1
13. MRZ Line 2
14. MRZ Line 3

---

## OCR reality
Scan-only PDFs may not contain a text layer.
The system therefore supports OCR fallback for PDFs when no embedded text is found.
If OCR still fails, PNG/JPG uploads remain the most reliable fallback.

---

## Business use inside tenancy workflow
Latest landlord Emirates ID reference can update:
- `landlord.emiratesId`

Latest tenant Emirates ID reference can update:
- `tenant.fullName`
- `tenant.emiratesId`

---

## Storage policy
- Save source under `records/emirates-id/master/<ownerTag>/<timestamp>/...`
- Save `emirates-id-reference.json` alongside source
- Save local indexed references for history + future autofill reuse
