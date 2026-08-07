# Tenancy Autofill Knowledge

**Last updated:** 2026-08-07  
**Source references:** `plans/implementation/TENANCY_TEMPLATE_AUTOFILL_REFERENCE.md`, `src/pdf/tenancyTemplateSchema.json`, `src/pdf/templateFieldRegistry.js`

---

## What this document preserves
- Template structure knowledge
- Field dictionary expectations
- Autofill readiness logic
- Template handling policy
- Mapping strategy for future upgrades

---

## Template facts
- Template family: DLD / Ejari Tenancy Contract
- Pages: 3
- Page 1: main fillable data sections
- Page 2: legal terms (mostly static)
- Page 3: rights + additional terms + signatures

---

## Main autofill domains
- `landlord.*`
- `tenant.*`
- `property.*`
- `payments.*`
- `tenancy.additionalTerms[]`
- `addendum.*`

---

## Critical inputs before autofill should be trusted
Autofill should ideally rely on these verified/collected sources:
- Landlord contact details
- Landlord Emirates ID reference
- Title Deed property reference
- Tenant Emirates ID reference
- Tenant passport/visa support docs

---

## Template-editing policy
1. Upload template once as **Master**
2. Generate an editable **Working Copy**
3. Autofill only working copy
4. Preserve master unchanged

---

## Future upgrade note
This knowledge should stay aligned with:
- `src/pdf/tenancyTemplateSchema.json`
- `src/pdf/tenancyTemplateSchema.js`
- `src/pdf/templateFieldRegistry.js`
