/**
 * Required fields registry (phase 1)
 *
 * Tenancy-first rollout: this file is the source of truth for blocking
 * required fields used by generation readiness selectors.
 */

const tenancyRequired = [
  { order: 1, path: 'tenant.fullName', label: 'Tenant Full Name', group: 'Tenant', blocking: true },
  { order: 2, path: 'landlord.name', label: 'Landlord Full Name', group: 'Landlord', blocking: true },
  { order: 3, path: 'property.unit', label: 'Property Unit', group: 'Property', blocking: true },
  { order: 4, path: 'property.community', label: 'Community', group: 'Property', blocking: true },
  {
    order: 5,
    path: 'payments.contractStartDate',
    label: 'Contract Start Date',
    group: 'Contract',
    blocking: true,
  },
  {
    order: 6,
    path: 'payments.contractEndDate',
    label: 'Contract End Date',
    group: 'Contract',
    blocking: true,
  },
  { order: 7, path: 'payments.annualRent', label: 'Annual Rent', group: 'Amounts', blocking: true },
];

export const REQUIRED_FIELDS_BY_TEMPLATE = {
  tenancy: tenancyRequired,
};

export const getRequiredFieldsForTemplate = (templateKey) => REQUIRED_FIELDS_BY_TEMPLATE[templateKey] || [];
