# Tenancy Contract Template — Autofill Reference (DLD/Ejari 3-Page Template)

**Last updated:** 2026-08-07  
**Purpose:** Canonical helper document for future auto-filling programs.  
**Scope:** The bilingual (English/Arabic) 3-page tenancy template shared in session.

---

## 1) Template Overview

- **Template family:** DLD / Ejari Tenancy Contract
- **Total pages:** **3**
- **Primary data-entry page:** **Page 1**
- **Static legal content page:** **Page 2**
- **Additional terms + rights page:** **Page 3**
- **Language:** English + Arabic
- **Typical output mode:** Contract PDF (+ optional addendum appended as extra pages)

---

## 2) Section Count and Section Names

## Page 1 (fillable)
1. **Header / Date**
2. **Owner / Lessor Information**
3. **Tenant Information**
4. **Property Information**
5. **Contract Information**
6. **Signatures (Tenant/Lessor + Date placeholders)**

## Page 2 (mostly static legal terms)
7. **Terms and Conditions**
8. **Signatures (Tenant/Lessor + Date placeholders)**

## Page 3 (partly fillable)
9. **Know Your Rights** (static)
10. **Attachments for Ejari Registration** (static list)
11. **Additional Terms** (fillable lines: 1..5)
12. **Signatures (Tenant/Lessor + Date placeholders)**

**Total recognized sections:** **12**  
**Sections requiring active auto-fill:** **7** (1,2,3,4,5,11,signature placeholders)

---

## 3) Field Catalog (Business Field Dictionary)

## A) Header / Meta

| Template Label | Canonical Key | Expected Value Type | Required | Example |
|---|---|---|---|---|
| Date | `property.documentDate` | `date-string` (DD MMM YYYY or ISO normalized for rendering) | Yes | `07 Aug 2026` |

---

## B) Owner / Lessor Information

| Template Label | Canonical Key | Type | Required | Validation / Notes |
|---|---|---|---|---|
| Owner’s Name | `landlord.name` | `string` | Yes | Full legal name; trim spaces |
| Lessor’s Name | `landlord.name` | `string` | Yes | Usually same as Owner name in this template |
| Lessor’s Emirates ID | `landlord.emiratesId` | `string` | Yes | Prefer UAE EID format / 15-digit normalized |
| License No. (if company) | `landlord.licenseNo` *(extension field)* | `string` | Conditional | Required only when lessor is company |
| Licensing Authority (if company) | `landlord.licensingAuthority` *(extension field)* | `string` | Conditional | E.g., DED / Freezone authority |
| Lessor’s Email | `landlord.email` | `email-string` | Recommended | RFC-like email check |
| Lessor’s Phone | `landlord.phone` | `phone-string` | Recommended | UAE-friendly phone normalization |

---

## C) Tenant Information

| Template Label | Canonical Key | Type | Required | Validation / Notes |
|---|---|---|---|---|
| Tenant’s Name | `tenant.fullName` | `string` | Yes | Full legal name |
| Tenant’s Emirates ID | `tenant.emiratesId` | `string` | Yes | UAE EID preferred |
| License No. (if company tenant) | `tenant.licenseNo` *(extension field)* | `string` | Conditional | Required only when tenant is company |
| Licensing Authority (if company tenant) | `tenant.licensingAuthority` *(extension field)* | `string` | Conditional | DED/Freezone authority |
| Tenant’s Email | `tenant.email` | `email-string` | Recommended | Email format check |
| Tenant’s Phone | `tenant.contactNo` | `phone-string` | Recommended | UAE-friendly normalization |

---

## D) Property Information

| Template Label | Canonical Key | Type | Required | Validation / Notes |
|---|---|---|---|---|
| Property Usage | `property.usage` | `enum` | Yes | `Residential | Commercial | Industrial` |
| Plot No. | `property.plotNo` | `string` | Optional | Keep exact source format |
| Makani No. | `property.makaniNo` | `string` | Optional | Numeric/string acceptable |
| Building Name | `property.cluster` *(or `property.buildingName` extension)* | `string` | Recommended | Prefer explicit building name if available |
| Property No. | `property.unit` | `string` | Yes | Unit/Property number |
| Property Type | `property.propertyType` | `string` | Yes | E.g., Apartment, Villa, Townhouse |
| Property Area (s.m) | `property.size` | `string/number` | Optional | Keep with unit clarity |
| Location | `property.community` | `string` | Yes | Community / Area |
| Premises No. (DEWA) | `property.dewaPremisesNo` | `string` | Optional | Exact number/string |

---

## E) Contract Information

| Template Label | Canonical Key | Type | Required | Validation / Notes |
|---|---|---|---|---|
| Contract Period (From) | `payments.contractStartDate` | `date-string` | Yes | Must be <= end date |
| Contract Period (To) | `payments.contractEndDate` | `date-string` | Yes | Must be >= start date |
| Contract Value | `payments.total` | `number/currency-string` | Recommended | Full contract amount |
| Annual Rent | `payments.annualRent` | `number` | Yes | > 0 |
| Security Deposit Amount | `payments.securityDeposit` | `number` | Yes | >= 0 |
| Mode of Payment | `payments.modeOfPayment` | `string` | Recommended | E.g., `1 Cheque`, `4 Cheques`, `Bank Transfer` |

---

## F) Additional Terms (Page 3)

| Template Label | Canonical Key | Type | Required | Validation / Notes |
|---|---|---|---|---|
| Additional Term 1..5 lines | `tenancy.additionalTerms[]` | `string[]` | Optional | Preserve order; max 5 lines for strict template compatibility |
| Extra legal/side terms | `tenancy.specialConditions` | `string` | Optional | May be split across lines if renderer supports |

---

## G) Signature Placeholders

| Template Label | Canonical Key | Type | Required | Notes |
|---|---|---|---|---|
| Tenant Signature placeholder | `signatures.tenant` *(future)* | `string/image-ref` | Optional | Usually manual signing stage |
| Tenant Signature Date | `signatures.tenantDate` *(future)* | `date-string` | Optional | Optional prefill |
| Lessor Signature placeholder | `signatures.lessor` *(future)* | `string/image-ref` | Optional | Usually manual signing stage |
| Lessor Signature Date | `signatures.lessorDate` *(future)* | `date-string` | Optional | Optional prefill |

---

## 4) Minimum Required Autofill Payload (Recommended)

To produce a usable tenancy contract autofill, collect at minimum:

1. `landlord.name`
2. `landlord.emiratesId`
3. `tenant.fullName`
4. `tenant.emiratesId`
5. `property.unit`
6. `property.community`
7. `property.usage`
8. `payments.contractStartDate`
9. `payments.contractEndDate`
10. `payments.annualRent`
11. `payments.securityDeposit`
12. `property.documentDate`

---

## 5) Data Normalization Rules (for Future Program)

1. **Trim all strings** (collapse repeated whitespace).
2. **Phone normalization:** preserve leading `+`, remove non-essential separators.
3. **Email normalization:** lowercase domain; keep local-part case as provided.
4. **Date normalization:** accept ISO input but render per template locale format.
5. **Currency fields:** parse numeric safely; keep 2 decimals when rendering amounts.
6. **Conditional company fields:** only populate license + authority when party is company.
7. **Enum safety:** property usage must map to one of: `Residential`, `Commercial`, `Industrial`.
8. **Contract dates:** hard validation `start <= end`.

---

## 6) Autofill Readiness Checklist

- [ ] Master template exists in `templates/tenancy/master/...`
- [ ] Editable working copy created in `templates/tenancy/working-copies/...`
- [ ] Required payload fields present
- [ ] Date range valid
- [ ] Numeric rent/deposit values valid
- [ ] Email/phone format checks passed (warning or blocking per policy)
- [ ] Additional terms count compatible with page-3 layout

---

## 7) Mapping Notes for Current Henry State

Current known mappings in code align with these paths:

- `landlord.*`
- `tenant.*`
- `property.*`
- `payments.*`
- `tenancy.additionalTerms[]`
- `addendum.*` (for separately attached addendum pages)

If future parser detects extra labels (e.g., company license blocks), extend store with:

- `landlord.licenseNo`, `landlord.licensingAuthority`
- `tenant.licenseNo`, `tenant.licensingAuthority`

so autofill can remain lossless.

---

## 8) Program-Learning Hint (Machine-Readable Mini Schema)

```json
{
  "templateId": "dld-ejari-v1",
  "pages": 3,
  "fillableSections": [
    "header",
    "ownerLessorInformation",
    "tenantInformation",
    "propertyInformation",
    "contractInformation",
    "additionalTerms",
    "signatures"
  ],
  "requiredFields": [
    "property.documentDate",
    "landlord.name",
    "landlord.emiratesId",
    "tenant.fullName",
    "tenant.emiratesId",
    "property.unit",
    "property.community",
    "property.usage",
    "payments.contractStartDate",
    "payments.contractEndDate",
    "payments.annualRent",
    "payments.securityDeposit"
  ]
}
```

---

## 9) Operational Recommendation

Use this template handling policy in tenancy modal:

1. Upload template once → save as **Master**.
2. Every edit session → auto-create **Working Copy**.
3. Autofill applies only to working copy.
4. Final output is generated and archived; master remains immutable.

This ensures reproducibility, auditability, and no accidental corruption of base template.

---

## 10) Machine-Readable Source of Truth in Codebase

The following files are now available for future autofill programs:

- `src/pdf/tenancyTemplateSchema.json` — canonical machine-readable template schema.
- `src/pdf/tenancyTemplateSchema.js` — helper utilities:
  - `getTenancyTemplateSchema()`
  - `getTenancyMinimumRequiredFields()`
  - `evaluateTenancyAutofillReadiness(documentData)`

Recommended usage: consume these directly in the tenancy generation modal before triggering autofill/export.
