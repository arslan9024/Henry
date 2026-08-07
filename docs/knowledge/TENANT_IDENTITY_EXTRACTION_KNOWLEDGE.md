# Tenant Identity Extraction Knowledge

**Last updated:** 2026-08-07  
**Source references:** `src/services/tenantIdentityExtractionService.js`, `src/components/tenantIdentity/TenantIdentityDocsPage.jsx`, `src/components/tenancyBuilder/TenancyContractBuilderPage.jsx`

---

## Purpose
Tenant identity extraction exists to turn passport and residence-permit scans into reusable autofill references for the tenancy workflow.

---

## Supported document types
- Passport
- Residence Permit / Visa

The parser normalizes `visa` and `residence-permit` into the residence-permit workflow type.

---

## Core passport fields
1. Passport Number
2. Full Name
3. Nationality
4. Date of Birth
5. Sex
6. Issue Date
7. Expiry Date
8. Place of Issue
9. MRZ Line 1
10. MRZ Line 2
11. MRZ Line 3

---

## Core residence-permit fields
1. Permit Number
2. Full Name
3. Nationality
4. Date of Birth
5. Issue Date
6. Expiry Date
7. Sponsor
8. Employer
9. Visa Type
10. File No
11. Unified No
12. MRZ Line 1
13. MRZ Line 2
14. MRZ Line 3

---

## OCR behavior
- The system accepts PDF, PNG, JPG, and JPEG inputs.
- Extracted text is produced locally in the browser.
- Scan-only PDFs can still be processed because the shared file extractor includes OCR fallback.
- If a document produces no usable text, the upload should be re-taken as a clearer image or a front/back scan.

---

## Readiness guidance
A parsed record is considered ready when the core fields for the selected document type are available.
- Passport readiness expects passport number, full name, nationality, date of birth, and expiry date.
- Residence-permit readiness expects permit number, full name, nationality, issue date, and expiry date.

---

## Business use inside tenancy workflow
Latest passport references can update:
- `tenant.fullName`
- `tenant.passportNo`
- `tenant.nationality`

Latest residence-permit references can update:
- `tenant.fullName`
- `tenant.nationality`

The tenancy builder can also show the number of saved passport and residence-permit references for hard-gate visibility.

---

## Storage policy
- Save source under `records/tenant-identity/master/<passport|residence-permit>/...`
- Save `tenant-identity-reference.json` alongside the source file
- Save local indexed references for history and future autofill reuse
- Inline Step 2 uploads and the dedicated tenant identity module both write to the same local reference store
