# Emirates ID — Autofill & Extraction Reference

**Last updated:** 2026-08-07  
**Document Type:** UAE Resident Identity Card (Front + Back)  
**Goal:** Extract personal information for tenant/landlord profiles and preserve as reusable autofill references.

---

## 1) Module Requirements

1. User must upload Emirates ID (PDF/PNG/JPG)
2. User must choose mandatory owner tag before save:
   - `tenant`
   - `landlord`
3. System extracts structured identity fields
4. System stores source file + structured JSON reference
5. System stores numbered scan items for future learning

---

## 2) Core Fields to Extract

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
15. Owner Tag (tenant/landlord)

---

## 3) Numbered Scan Items from Provided Sample

1. Document Type: Emirates ID
2. ID Number: 784-1984-5852080-0
3. Full Name: Khalif Mohamednur Ibrahim
4. Date of Birth: 12/07/1984
5. Nationality: Kenya
6. Issuing Date: 16/06/2025
7. Expiry Date: 15/06/2027
8. Sex: M
9. Card Number: 146532347
10. Occupation: Sales Officer
11. Employer: Jayeeco General Trading L.L.C
12. Issuing Place: null (as printed in sample)
13. MRZ Line 1: ILARE1465323471784198458520800
14. MRZ Line 2: 8407122M2706155KEN<<<<<<<<<<<<1
15. MRZ Line 3: IBRAHIM<<KHALIF<MOHAMEDNUR<<<<

---

## 4) Storage Policy

For each Emirates ID upload:

1. Save source under `records/emirates-id/master/<ownerTag>/<timestamp>/...`
2. Save parsed JSON as `emirates-id-reference.json` in same path
3. Save local history index with:
   - fileName
   - ownerTag
   - createdAt
   - numberedItems
   - extractedText

This provides auditability and fast retrieval for future autofill.

---

## 5) OCR Reality Note

If a PDF is scan-only and PDF text layer is empty, parser may return no text. In that case, upload front/back as images (PNG/JPG) for OCR extraction.
