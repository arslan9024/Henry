import { defineSchema, required, email, phone, number, min, minLen } from '../../forms/validation';

/**
 * Validation schema for the DLD Ejari Tenancy Contract template.
 *
 * Rules are intentionally conservative — only flag the handful of fields
 * whose absence would make the contract legally incomplete or cause the
 * EjariPDF to render blank placeholders. Everything else stays optional
 * so the "Save Draft" workflow remains friction-free.
 */
export const tenancyFormSchema = defineSchema({
  // ── Core property identity ──────────────────────────────────────────────────
  'property.unit': [required('Unit number is required')],
  'property.community': [required('Community is required')],

  // ── Parties ─────────────────────────────────────────────────────────────────
  'tenant.fullName': [required("Tenant's full name is required"), minLen(2)],
  'tenant.emiratesId': [minLen(15, 'Emirates ID appears too short')],
  'landlord.name': [required("Landlord's name is required")],

  // ── Financial terms ─────────────────────────────────────────────────────────
  'payments.annualRent': [number(), min(1, 'Annual rent must be greater than zero')],
  'payments.securityDeposit': [number(), min(0)],
  'payments.total': [number(), min(0)],

  // ── Contract dates ──────────────────────────────────────────────────────────
  'payments.contractStartDate': [required('Contract start date is required')],
  'payments.contractEndDate': [required('Contract end date is required')],

  // ── Ejari info ───────────────────────────────────────────────────────────────
  // Optional but included so inline error hints appear when mistyped.
  'tenant.email': [email()],
  'landlord.email': [email()],
  'tenant.contactNo': [phone()],
  'landlord.phone': [phone()],
});

export default tenancyFormSchema;
