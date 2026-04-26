import { defineSchema, required, minLen } from '../../forms/validation';

/**
 * Validation schema for the Standard Tenancy Addendum (RERA).
 *
 * Locked-value fields (securityDeposit, renewalCharges, noticePeriodDays,
 * legalReference, maintenanceCap) are deliberately omitted — they are
 * rendered as read-only policy display, not as user-editable inputs.
 */
export const addendumFormSchema = defineSchema({
  // ── Contract reference ───────────────────────────────────────────────────────
  'addendum.originalContractRef': [required('Original contract reference is required')],
  'addendum.effectiveDate': [required('Effective date is required')],

  // ── Parties (drawn from shared document sections) ───────────────────────────
  'tenant.fullName': [required("Tenant's full name is required"), minLen(2)],
  'landlord.name': [required("Landlord's name is required")],
});

export default addendumFormSchema;
