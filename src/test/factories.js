/**
 * Minimal documentData factory used across compliance and slice tests.
 * Mirrors the shape of `documentSlice.initialState` but only includes
 * the branches the rule engine touches.
 */
export const makeDoc = (overrides = {}) => ({
  tenant: { fullName: '', emiratesId: '', passportNo: '', occupation: '', ...overrides.tenant },
  landlord: { name: '', ...overrides.landlord },
  property: {
    unit: '',
    community: '',
    referenceNo: '',
    documentDate: '',
    makaniNo: '',
    plotNo: '',
    ...overrides.property,
  },
  payments: {
    moveInDate: '',
    contractStartDate: '',
    contractEndDate: '',
    signingDeadline: '',
    securityDeposit: '',
    total: '',
    ...overrides.payments,
  },
  broker: { orn: '', brn: '', commercialLicenseNumber: '', ...overrides.broker },
  viewing: { rentalBudget: '', ...overrides.viewing },
  occupancy: { ejariOccupantsRegistered: false, occupants: '', ...overrides.occupancy },
  addendum: {
    originalContractRef: '',
    effectiveDate: '',
    securityDeposit: 4000,
    renewalCharges: 1050,
    maintenanceCap: 1000,
    noticePeriodDays: 90,
    legalReference: 'Dubai Law No. 26 of 2007',
    landlordServices: [],
    additionalClauses: [],
    ...overrides.addendum,
  },
});
