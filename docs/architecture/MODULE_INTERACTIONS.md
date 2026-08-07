# Module Interactions

**Last updated:** 2026-08-07

---

## Module set
1. **Tenancy Contract Builder**
2. **Title Deed Extractor**
3. **Emirates ID Extractor**
4. **Tenant Passport & Residence Permit Scanner**

---

## High-level workflow
1. User starts in **Tenancy Contract Builder**
2. Step 1 requires landlord contact data + title deed + landlord Emirates ID
3. Title deed module extracts property facts and saves reference
4. Emirates ID module extracts identity facts and saves tagged reference
5. Builder can apply latest references back into form state
6. Tenant identity module extracts passport and residence-permit fields and saves reusable references
7. Step 2 requires tenant contact data + tenant Emirates ID + passport + residence permit/visa
8. Once both hard gates pass, contract autofill/export can proceed

---

## Data flow
### Title Deed → Builder
- Upload source document
- Extract structured fields
- Save numbered reference items
- Builder reads latest title deed reference and applies property fields

### Emirates ID → Builder
- Upload source document
- Select `tenant` or `landlord` tag
- Extract structured identity fields
- Save numbered reference items
- Builder reads latest tagged reference and applies appropriate profile fields

### Tenant passport / residence permit → Builder
- Upload directly in Step 2 or through the dedicated tenant identity module
- Extract structured identity fields and raw OCR text
- Save as tenant document references
- Count toward tenant readiness gate
- Builder reads latest passport / residence-permit references and applies tenant profile fields

---

## Storage model
- Title deed references: local index + saved source/reference file
- Emirates ID references: local index + saved source/reference file
- Tenant identity references: local index + saved source/reference file
- Tenancy templates: master copy + working copy

---

## Blocking architecture
- Step 1 readiness is evaluated from landlord fields + landlord uploads
- Step 2 readiness is evaluated from tenant fields + tenant uploads
- Export/autofill path checks both readiness groups before generation
