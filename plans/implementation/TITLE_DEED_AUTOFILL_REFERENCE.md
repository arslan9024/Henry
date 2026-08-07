# Title Deed — Autofill & Extraction Reference

**Last updated:** 2026-08-07  
**Document Type:** Dubai Land Department Title Deed (single-page bilingual)  
**Goal:** Enable reliable extraction and reuse of property ownership facts for future autofill.

---

## 1) Section Breakdown

1. Header (Title + bilingual heading)
2. Core Property Meta Block
3. Owners and Shares Table
4. Purchase / Transfer Narrative Block
5. Legal Conditions Narrative
6. Certificate / Authority Footer

**Total sections:** 6

---

## 2) Key Fields to Extract

1. Issue Date
2. Mortgage Status
3. Property Type
4. Community
5. Plot No
6. Municipality No
7. Area Sq Meter
8. Area Sq Feet
9. Owner Number (e.g., 5124391)
10. Owner Name (e.g., BUKO COMMODITY DMCC)
11. Land Registration No
12. Purchase Date
13. Purchase Amount (AED)
14. Certificate Number (e.g., 93757/2025)

---

## 3) Numbered Scan Items from Provided Document

1. Document Type: Title Deed
2. Issue Date: 13/10/2025
3. Mortgage Status: Not mortgaged
4. Property Type: Land
5. Community: Madinat Hind 4
6. Plot Number: 7354
7. Municipality Number: 914 - 20879
8. Area (Sq Meter): 192.49
9. Area (Sq Feet): 2,071.95
10. Owner Number: 5124391
11. Owner Name: BUKO COMMODITY DMCC
12. Land Registration Number: 22855/2023
13. Purchase Date: 10/13/2025
14. Purchase Amount (AED): 1717600
15. Certificate Number: 93757/2025
16. Issuing Authority: Dubai Land Department

---

## 4) Extraction Rules

- Normalize spacing before regex extraction.
- Keep numeric fields both raw-string and parsed-number where useful.
- Mortgage status should normalize to canonical values:
  - `Not mortgaged`
  - `Mortgaged` (if detected in future docs)
- Accept bilingual text; extraction should prefer English labels when available.
- Preserve source text snapshot for audit and parser retraining.

---

## 5) Storage Policy

For each uploaded title deed:

1. Save original file under `records/title-deed/master/<timestamp>/...`
2. Save structured JSON reference under same path as `title-deed-reference.json`
3. Save local indexed reference list (latest entries) for quick history view in module

This creates a reusable document memory layer for future autofill systems.
