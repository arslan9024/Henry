# Tenant Step-2 Mandatory Gate Rules (Tenancy Contract Builder)

**Last updated:** 2026-08-07  
**Applies to:** Tenancy Contract Builder → Step 2 (Tenant)

## Hard-Block Rule
Step 2 **must not** proceed to Step 3 unless all five mandatory requirements are satisfied.

## Mandatory Requirements (All Required)
1. **Tenant Mobile**
   - Field: `tenant.contactNo`
   - Current default: `+971 52 864 3118`
2. **Tenant Email**
   - Field: `tenant.email`
   - Current default: `Mahmoud.mufty@gmail.com`
3. **Tenant Emirates ID Uploaded**
   - At least one Emirates ID upload tagged with `ownerTag=tenant`
4. **Tenant Passport Copy Uploaded**
   - At least one tenant passport document upload
5. **Tenant Visa / Residence Permit Uploaded**
   - At least one tenant visa/residence permit upload

## Blocking Behavior
If any requirement is missing:
- Step 2 stays active
- Continue action is blocked
- Warning toast shows missing keys

## Autofill Readiness Rule
Tenancy contract autofilling/export process should proceed only when **both** hard gates are complete:

- Landlord Step-1 mandatory gate complete
- Tenant Step-2 mandatory gate complete

If either gate is incomplete, autofill/export is blocked.

## Storage/Reference Expectations
- Emirates ID references are checked by owner tag (`tenant` or `landlord`).
- Passport and visa uploads are persisted as tenant document references.

## Policy Note
This gate is business critical and should remain **hard-blocking**, not warning-only.
