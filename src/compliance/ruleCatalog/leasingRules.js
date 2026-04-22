export const leasingRules = {
  viewing: [
    { id: 'VIEW-1', severity: 'important', message: 'Property unit and location should be specified.' },
    { id: 'VIEW-2', severity: 'info', message: 'Viewing date/time and agent name should be documented.' },
  ],
  booking: [
    { id: 'BOOK-1', severity: 'critical', message: 'Tenant full name is missing.' },
    { id: 'BOOK-2', severity: 'critical', message: 'Emirates ID is missing.' },
    { id: 'BOOK-3', severity: 'important', message: 'Move-in date and contract period should be clearly stated.' },
  ],
  bookingGov: [
    { id: 'GOV-1', severity: 'critical', message: 'Government/military payer note is required.' },
    { id: 'GOV-2', severity: 'important', message: 'Post-dated cheque timing clause should be included.' },
  ],
  addendum: [
    { id: 'ADD-1', severity: 'important', message: 'Original tenancy contract reference number should be included.' },
  ],
  tenancy: [
    { id: 'TEN-1', severity: 'critical', message: 'Landlord and tenant identities must be complete before issue.' },
    { id: 'TEN-2', severity: 'important', message: 'Ejari-related obligations should be clearly included.' },
  ],
  invoice: [
    { id: 'INV-1', severity: 'critical', message: 'Invoice beneficiary and payment purpose must be explicit.' },
  ],
  keyHandover: [
    { id: 'KEY-1', severity: 'important', message: 'Key count and condition checklist should be signed by both parties.' },
  ],
};
