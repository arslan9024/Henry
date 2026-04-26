# DLD Ejari — Official Tenancy Contract Template (Source Reference)

> Source: Government of Dubai — Dubai Land Department.
> Uploaded by user on 2026-04-23 and adopted as the canonical Tenancy Contract template for Henry.
> This document captures the **field specification** extracted from the official PDF so the renderer in
> `src/pdf/EjariPDF.jsx` stays faithful to the government layout.

## Page 1 — Header

- Government of Dubai crest (left) | Dubai Land Department logo (right)
- Centered bilingual title: **عقد إيجار / TENANCY CONTRACT**
- Date row (bilingual): `Date ____  |  التاريخ`

## Page 1 — Sections

### 1. Owner / Lessor Information — معلومات المالك/ المؤجر

| EN                                        | AR                            | Henry Field                                  |
| ----------------------------------------- | ----------------------------- | -------------------------------------------- |
| Owner's Name                              | اسم المالك                    | `landlord.name`                              |
| Lessor's Name                             | اسم المؤجر                    | `landlord.name`                              |
| Lessor's Emirates ID                      | الهوية الإماراتية للمؤجر      | `landlord.emiratesId`                        |
| License No. (Incase of a Company)         | رقم الرخصة (في حال كانت شركة) | `company.dedLicense`                         |
| Licensing Authority (Incase of a Company) | سلطة الترخيص                  | `company.licensingAuthority` (default `DED`) |
| Lessor's Email                            | البريد الإلكتروني للمؤجر      | `landlord.email`                             |
| Lessor's Phone                            | رقم هاتف المؤجر               | `landlord.phone`                             |

### 2. Tenant Information — معلومات المستأجر

| EN                                | AR                         | Henry Field                                      |
| --------------------------------- | -------------------------- | ------------------------------------------------ |
| Tenant's Name                     | اسم المستأجر               | `tenant.fullName`                                |
| Tenant's Emirates ID              | الهوية الإماراتية للمستأجر | `tenant.emiratesId`                              |
| License No. / Licensing Authority | رقم الرخصة / سلطة الترخيص  | `tenant.licenseNo` / `tenant.licensingAuthority` |
| Tenant's Email                    | البريد الإلكتروني للمستأجر | `tenant.email`                                   |
| Tenant's Phone                    | رقم هاتف المستأجر          | `tenant.contactNo`                               |

### 3. Property Information — معلومات العقار

| EN                                                     | AR                      | Henry Field                               |
| ------------------------------------------------------ | ----------------------- | ----------------------------------------- |
| Property Usage (Residential / Commercial / Industrial) | استخدام العقار          | `property.usage` (default `Residential`)  |
| Plot No.                                               | رقم الأرض               | `property.plotNo`                         |
| Makani No.                                             | رقم مكاني               | `property.makaniNo`                       |
| Building Name                                          | اسم المبنى              | `property.cluster`                        |
| Property No.                                           | رقم العقار              | `property.unit`                           |
| Property Type                                          | نوع الوحدة              | `property.description`                    |
| Property Area (s.m)                                    | مساحة العقار (متر.مربع) | `property.size`                           |
| Location                                               | الموقع                  | `${property.community}, ${property.city}` |
| Premises No. (DEWA)                                    | رقم المبنى (ديوا)       | `property.dewaPremisesNo`                 |

### 4. Contract Information — معلومات العقد

| EN                          | AR                    | Henry Field                                               |
| --------------------------- | --------------------- | --------------------------------------------------------- |
| Contract Period (From / To) | فترة العقد (من / إلى) | `payments.contractStartDate` / `payments.contractEndDate` |
| Contract Value              | قيمة العقد            | `payments.total`                                          |
| Annual Rent                 | الايجار السنوي        | `payments.annualRent`                                     |
| Security Deposit Amount     | مبلغ التأمين          | `payments.securityDeposit`                                |
| Mode of Payment             | طريقة الدفع           | `payments.modeOfPayment`                                  |

### Signatures (every page footer)

- Tenant Signature | توقيع المستأجر | Date | التاريخ
- Lessor's Signature | توقيع المؤجر | Date | التاريخ

## Page 2 — Terms and Conditions / الأحكام و الشروط

Fixed legal text — **MUST** be reproduced verbatim from the official PDF (14 numbered clauses,
bilingual side-by-side). See `EjariPDF.jsx` `TERMS_EN` / `TERMS_AR` constants.

## Page 3 — Know your Rights / Attachments / Additional Terms

- **Know your Rights** — bilingual block referencing Laws 26/2007, 33/2008, 43/2013 + RDC at dubailand.gov.ae
- **Attachments for Ejari Registration** — bilingual list (Original unified tenancy contract; Original Emirates ID of applicant)
- **Additional Terms — شروط إضافية** — 5 numbered free-text rows; populated from `eviction.additionalTerms[]` (optional)
- Footer: Tel 8004488 · Fax +971 4 222 2251 · P.O. Box 1166 · `support@dubailand.gov.ae` · `www.dubailand.gov.ae`

## Visual Style (DLD)

- Section headers: white text on **navy band** (#1f2a4d), full-width
- Field rows: thin underline, label + dotted line value
- Bilingual: English on left, Arabic on right
- Watermark: light "EJARI / إيجاري" text — omitted in our reproduction (proprietary)
