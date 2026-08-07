# Mandatory Gates

**Last updated:** 2026-08-07

---

## Global Rule
Tenancy contract autofill/export **must not proceed** unless both mandatory gate groups are complete:

- **Landlord Step-1 Gate**
- **Tenant Step-2 Gate**

If either gate is incomplete, the workflow remains blocked.

---

## Step 1 — Landlord Mandatory Gate

### Required items
1. `landlord.phone`
2. `landlord.email`
3. At least one **Title Deed** upload/reference
4. At least one **Emirates ID** upload/reference with `ownerTag=landlord`

### Current defaults
- Landlord phone: `+254 720 985595`
- Landlord email: `mohamedkifaru@gmail.com`

### Behavior
- Cannot proceed to Step 2 until all are satisfied
- Live checklist must show presence/count status
- Blocking toast must explain missing requirements

---

## Step 2 — Tenant Mandatory Gate

### Required items
1. `tenant.contactNo`
2. `tenant.email`
3. At least one **Emirates ID** upload/reference with `ownerTag=tenant`
4. At least one **Passport copy** upload/reference
5. At least one **Residence Permit / Visa** upload/reference (stored as `type=residence-permit`, legacy `visa` supported)

### Current defaults
- Tenant phone: `+971 52 864 3118`
- Tenant email: `Mahmoud.mufty@gmail.com`

### Behavior
- Cannot proceed to Step 3 until all are satisfied
- Live checklist must show presence/count status
- Blocking toast must explain missing requirements

---

## Export / Autofill Blocking Rule

Autofill/download/save generation should be blocked unless:
- Step 1 ready = `true`
- Step 2 ready = `true`

This is a hard business rule, not a soft warning.

---

## Related Reference Docs
- [`../LANDLORD_STEP1_MANDATORY_RULES.md`](../LANDLORD_STEP1_MANDATORY_RULES.md)
- [`../TENANT_STEP2_MANDATORY_RULES.md`](../TENANT_STEP2_MANDATORY_RULES.md)
