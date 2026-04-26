export const leasingRules = {
  viewing: [
    {
      id: 'VIEW-1',
      severity: 'critical',
      message: 'Property unit and community must be specified (RERA P210 mandatory disclosure).',
    },
    { id: 'VIEW-2', severity: 'critical', message: 'Agreement date is required.' },
    {
      id: 'VIEW-3',
      severity: 'critical',
      message: 'Broker ORN, BRN and Commercial License are mandatory under RERA Circular 21-2016.',
    },
    {
      id: 'VIEW-4',
      severity: 'critical',
      message: 'Tenant name and Emirates ID / Passport must be captured.',
    },
    {
      id: 'VIEW-5',
      severity: 'important',
      message: 'Makani No. and Plot No. should be entered for verifiable property identification.',
    },
    {
      id: 'VIEW-6',
      severity: 'important',
      message: 'Approximate rental budget should be recorded for client matching.',
    },
  ],
  booking: [
    { id: 'BOOK-1', severity: 'critical', message: 'Tenant full name is missing.' },
    { id: 'BOOK-2', severity: 'critical', message: 'Emirates ID is missing.' },
    {
      id: 'BOOK-3',
      severity: 'important',
      message: 'Move-in date and contract period should be clearly stated.',
    },
  ],
  bookingGov: [
    { id: 'GOV-1', severity: 'critical', message: 'Government/military payer note is required.' },
    { id: 'GOV-2', severity: 'important', message: 'Post-dated cheque timing clause should be included.' },
  ],
  addendum: [
    {
      id: 'ADD-1',
      severity: 'important',
      message: 'Original tenancy contract reference number should be included.',
    },
    {
      id: 'ADD-2',
      severity: 'critical',
      message: 'Tenant full name is required on the addendum.',
    },
    {
      id: 'ADD-3',
      severity: 'important',
      message: 'Addendum effective date should be set before issue.',
    },
  ],
  tenancy: [
    {
      id: 'TEN-1',
      severity: 'critical',
      message: 'Landlord and tenant identities must be complete before issue.',
    },
    { id: 'TEN-2', severity: 'important', message: 'Ejari-related obligations should be clearly included.' },
  ],
  invoice: [
    {
      id: 'INV-1',
      severity: 'critical',
      message: 'Invoice beneficiary and payment purpose must be explicit.',
    },
  ],
  keyHandover: [
    {
      id: 'KEY-1',
      severity: 'important',
      message: 'Key count and condition checklist should be signed by both parties.',
    },
  ],
};
