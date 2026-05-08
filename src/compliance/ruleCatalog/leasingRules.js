export const leasingRules = {
  viewing: [
    {
      id: 'VIEW-1',
      severity: 'critical',
      message: 'Property unit and community must be specified (RERA P210 mandatory disclosure).',
      evaluate: (d) => !d.property.unit || !d.property.community,
    },
    {
      id: 'VIEW-2',
      severity: 'critical',
      message: 'Agreement date is required.',
      evaluate: (d) => !d.property.documentDate,
    },
    {
      id: 'VIEW-3',
      severity: 'critical',
      message: 'Broker ORN, BRN and Commercial License are mandatory under RERA Circular 21-2016.',
      evaluate: (d) => !d.broker?.orn || !d.broker?.brn || !d.broker?.commercialLicenseNumber,
    },
    {
      id: 'VIEW-4',
      severity: 'critical',
      message: 'Tenant name and Emirates ID / Passport must be captured.',
      evaluate: (d) => !d.tenant.fullName || (!d.tenant.emiratesId && !d.tenant.passportNo),
    },
    {
      id: 'VIEW-5',
      severity: 'important',
      message: 'Makani No. and Plot No. should be entered for verifiable property identification.',
      evaluate: (d) => !d.property.makaniNo || !d.property.plotNo,
    },
    {
      id: 'VIEW-6',
      severity: 'important',
      message: 'Approximate rental budget should be recorded for client matching.',
      evaluate: (d) => !d.viewing?.rentalBudget,
    },
  ],
  booking: [
    {
      id: 'BOOK-1',
      severity: 'critical',
      message: 'Tenant full name is missing.',
      evaluate: (d) => !d.tenant.fullName,
    },
    {
      id: 'BOOK-2',
      severity: 'critical',
      message: 'Emirates ID is missing.',
      evaluate: (d) => !d.tenant.emiratesId,
    },
    {
      id: 'BOOK-3',
      severity: 'important',
      message: 'Move-in date and contract period should be clearly stated.',
      evaluate: (d) => !d.payments.moveInDate || !d.payments.contractStartDate || !d.payments.contractEndDate,
    },
  ],
  bookingGov: [
    {
      id: 'GOV-1',
      severity: 'critical',
      message: 'Government/military payer note is required.',
      evaluate: (d) => !d.tenant.occupation,
    },
    {
      id: 'GOV-2',
      severity: 'important',
      message: 'Post-dated cheque timing clause should be included.',
      evaluate: (d) => !d.payments.signingDeadline,
    },
  ],
  addendum: [
    {
      id: 'ADD-1',
      severity: 'important',
      message: 'Original tenancy contract reference number should be included.',
      evaluate: (d) => !d.addendum?.originalContractRef,
    },
    {
      id: 'ADD-2',
      severity: 'critical',
      message: 'Tenant full name is required on the addendum.',
      evaluate: (d) => !d.tenant.fullName,
    },
    {
      id: 'ADD-3',
      severity: 'important',
      message: 'Addendum effective date should be set before issue.',
      evaluate: (d) => !d.addendum?.effectiveDate,
    },
  ],
  tenancy: [
    {
      id: 'TEN-1',
      severity: 'critical',
      message: 'Landlord and tenant identities must be complete before issue.',
      evaluate: (d) => !d.landlord.name || !d.tenant.fullName,
    },
    {
      id: 'TEN-2',
      severity: 'important',
      message: 'Ejari-related obligations should be clearly included.',
      evaluate: (d) => !d.occupancy.ejariOccupantsRegistered,
    },
  ],
  invoice: [
    {
      id: 'INV-1',
      severity: 'critical',
      message: 'Invoice beneficiary and payment purpose must be explicit.',
      evaluate: (d) => !d.landlord.name || !d.payments.total,
    },
  ],
  keyHandover: [
    {
      id: 'KEY-1',
      severity: 'important',
      message: 'Key count and condition checklist should be signed by both parties.',
      evaluate: (d) => !d.occupancy.occupants,
    },
  ],
};
