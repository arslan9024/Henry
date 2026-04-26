import { defineSchema, required, email, phone, minLen, number, min } from '../../forms/validation';

/**
 * Per-template validation schema for the RERA P210 Viewing Agreement.
 *
 * Schema-driven validation lets the template render inline errors without
 * inline if/else logic. Keep the rule set conservative — only flag fields
 * the regulator actually requires; everything else stays optional so the
 * "Save draft" workflow remains friction-free.
 *
 * Path convention is `section.field` (matches `useDocumentForm`'s flat key
 * system). The hook splits on the first dot and dispatches against the
 * existing documentSlice, so no Redux changes are needed.
 */
export const viewingFormSchema = defineSchema({
  // ── Broker block ──
  // Identity is required (the agreement is null without it); ORN/BRN are
  // optional in draft mode.
  'broker.companyName': [required('Broker company is required')],
  'broker.brokerName': [required("Broker's name is required")],
  'broker.email': [email()],

  // ── Tenant block ──
  'tenant.fullName': [required("Tenant's name is required"), minLen(2)],
  'tenant.email': [email()],
  'tenant.contactNo': [phone()],

  // ── Property block ──
  // Unit + community + status pin the property; everything else is fluffier
  // metadata and stays optional.
  'property.unit': [required('Unit / property number is required')],
  'property.community': [required('Community is required')],
  'property.parkingCount': [number(), min(0)],

  // ── Viewing schedule ──
  // The form's whole purpose. Both required.
  'viewing.viewingDate': [required('Viewing date is required')],
  'viewing.viewingTime': [required('Viewing time is required')],
});

export default viewingFormSchema;
