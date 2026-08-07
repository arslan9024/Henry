# Document Upload Matrix

**Last updated:** 2026-08-07

| Step | Party | Required Document / Data | Required? | Stored/Tagged As | Unlocks |
|---|---|---|---|---|---|
| 1 | Landlord | Mobile number | Yes | `landlord.phone` | Step 1 readiness |
| 1 | Landlord | Email | Yes | `landlord.email` | Step 1 readiness |
| 1 | Property/Landlord | Title Deed | Yes | `records/title-deed/master/...` | Property autofill + Step 1 readiness |
| 1 | Landlord | Emirates ID | Yes | `records/emirates-id/master/landlord/...` | Landlord identity autofill + Step 1 readiness |
| 2 | Tenant | Mobile number | Yes | `tenant.contactNo` | Step 2 readiness |
| 2 | Tenant | Email | Yes | `tenant.email` | Step 2 readiness |
| 2 | Tenant | Emirates ID | Yes | `records/emirates-id/master/tenant/...` | Tenant identity autofill + Step 2 readiness |
| 2 | Tenant | Passport copy | Yes | tenant document reference `type=passport` | Step 2 readiness + tenant autofill |
| 2 | Tenant | Visa / Residence Permit | Yes | tenant document reference `type=residence-permit` (legacy `visa`) | Step 2 readiness + tenant autofill |
| 3+ | Property | Property details | Yes | `property.*` | Contract data completeness |
| 4+ | Contract | Dates / rent / deposit / mode | Yes | `payments.*` | Contract generation |
| 5+ | Contract | Additional terms | Optional | `tenancy.additionalTerms[]` | Page 3 autofill |
| 6 | Addendum | Addendum fields | Conditional | `addendum.*` | Addendum output |

---

## Storage Principles
- Source docs should be preserved for future autofill reference.
- Emirates ID records must always be tagged as `tenant` or `landlord`.
- Tenancy templates must keep master-copy and working-copy separation.
