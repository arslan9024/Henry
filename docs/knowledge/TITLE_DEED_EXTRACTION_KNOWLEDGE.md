# Title Deed Extraction Knowledge

**Last updated:** 2026-08-07  
**Source references:** `plans/implementation/TITLE_DEED_AUTOFILL_REFERENCE.md`, `src/services/titleDeedExtractionService.js`, `src/pdf/titleDeedTemplateSchema.json`

---

## Purpose
Title deed extraction exists to provide trusted property facts that can autofill tenancy property fields.

---

## Key extracted fields
1. Issue Date
2. Mortgage Status
3. Property Type
4. Community
5. Plot No
6. Municipality No
7. Area Sq Meter
8. Area Sq Feet
9. Owner Number
10. Owner Name
11. Land Registration No
12. Purchase Date
13. Purchase Amount (AED)
14. Certificate Number
15. Issuing Authority

---

## Sample known scan items
The current known reference sample includes:
- Community: `Madinat Hind 4`
- Plot No: `7354`
- Property Type: `Land`
- Area Sq Meter: `192.49`
- Owner Name: `BUKO COMMODITY DMCC`

---

## Business use inside tenancy workflow
Latest title deed reference can be used to update:
- `property.plotNo`
- `property.community`
- `property.propertyType`
- `property.size`

---

## Storage policy
- Save original file under `records/title-deed/master/...`
- Save `title-deed-reference.json` alongside source
- Save local indexed references for latest reuse
