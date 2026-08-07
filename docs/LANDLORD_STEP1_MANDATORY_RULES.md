# Landlord Step-1 Mandatory Gate Rules (Tenancy Contract Builder)

**Last updated:** 2026-08-07  
**Applies to:** Tenancy Contract Builder → Step 1 (Landlord)

## Hard-Block Rule
Step 1 **must not** proceed to Step 2 unless all four mandatory requirements are satisfied.

## Mandatory Requirements (All Required)
1. **Landlord Mobile**
   - Field: `landlord.phone`
   - Current default: `+254 720 985595`
2. **Landlord Email**
   - Field: `landlord.email`
   - Current default: `mohamedkifaru@gmail.com`
3. **Title Deed Uploaded**
   - At least one uploaded title deed reference must exist.
4. **Landlord Emirates ID Uploaded**
   - At least one Emirates ID reference tagged with ownerTag=`landlord` must exist.

## Blocking Behavior
If any requirement is missing:
- Step 1 stays active
- Continue action is blocked
- User receives blocking warning toast with missing keys

## UX Visibility Requirements
- Step 1 should show live gate status checklist:
  - mobile present/missing
  - email present/missing
  - title deed upload count
  - landlord Emirates ID upload count

## Storage/Reference Expectations
- Title deed uploads saved in records and indexed references.
- Emirates ID uploads saved in records and indexed references.
- Emirates ID must carry owner tag (`tenant` or `landlord`), and only `landlord` tagged entries satisfy this Step-1 landlord gate.

## Policy Note
This gate is **business critical** and should not be downgraded to warning-only behavior.
