import { createSlice } from '@reduxjs/toolkit';

export const CANONICAL_LANDLORD_NAME = 'MUHAMMAD NAEEM MUHAMMAD H K KHAN';

const initialState = {
  company: {
    name: 'White Caves Real Estate L.L.C',
    dedLicense: '1388443',
    role: 'Authorized Property Leasing Agent',
    city: 'Dubai',
  },
  property: {
    referenceNo: 'WHITE CAVES / BOOKING / 449 / 2026',
    documentDate: '22 April 2026',
    unit: 'Unit 449',
    cluster: 'Avencia-2',
    community: 'Damac Hills 2',
    city: 'Dubai',
    description: '4 Bedroom Townhouse (Corner Unit)',
    size: '1,505.23 / 1,776.26 Sq. Ft.',
    parking: 'Two (2) Allocated Spaces',
    condition: 'Unfurnished — Deep cleaned & fully maintained before move-in (at no cost to tenant)',
    // DLD/RERA-aligned fields used by Tenancy Contract & Viewing Agreement
    usage: 'Residential',
    plotNo: '',
    makaniNo: '',
    dewaPremisesNo: '',
    projectName: 'Damac Hills 2',
    buildingNumber: '',
    ownersAssociationNo: '',
    propertyStatus: 'Vacant — Ready to move in',
    parkingCount: 2,
    propertyType: 'Villa',
  },
  broker: {
    orn: '',
    companyName: 'White Caves Real Estate L.L.C',
    commercialLicenseNumber: '1388443',
    brokerName: 'Arslan Malik',
    brn: '',
    phone: '',
    mobile: '',
    address: 'Dubai, U.A.E.',
    email: '',
  },
  viewing: {
    agreementNumber: 'WC-VIEW-2026-001',
    rentalBudget: '',
    additionalInfo: '',
    servicesNotes: '',
    viewingDate: '',
    viewingTime: '',
  },
  tenant: {
    fullName: '',
    emiratesId: '',
    idExpiryDate: '',
    contactNo: '',
    occupation: 'UAE Armed Forces (Military Personnel)',
    category: 'government-military',
    email: '',
    passportNo: '',
    address: '',
    poBox: '',
  },
  landlord: {
    name: CANONICAL_LANDLORD_NAME,
    emiratesId: '',
    idExpiryDate: '',
    iban: 'AE030359356491705358002',
    bank: 'First Abu Dhabi Bank (FAB)',
    swift: 'NBADAEAA',
    email: '',
    phone: '',
  },
  payments: {
    moveInDate: '01 May 2026',
    contractStartDate: '01 May 2026',
    contractEndDate: '30 April 2027',
    signingDeadline: '01 May 2026',
    annualRent: 85000,
    securityDeposit: 4250,
    agencyFee: 4250,
    ejariFee: 265,
    total: 93765,
    modeOfPayment: '4 Cheques',
  },
  renewal: {
    currentRent: 85000,
    proposedRent: 85000,
    marketRent: 90000,
    renewalDate: '30 April 2027',
    noticeSentDate: '',
    noticeChannel: 'not-set',
  },
  occupancy: {
    isSharedHousing: false,
    sharedHousingPermitNumber: '',
    ejariOccupantsRegistered: false,
    occupants: '',
  },
  eviction: {
    reason: 'none',
    noticeDate: '',
    noticeMethod: 'notarized',
  },
  // ─── Tenancy-contract-specific fields ────────────────────────────────────
  // All fields required to render and export the Ejari tenancy PDF without
  // undefined access.  Array fields use safe empty-array defaults; scalar
  // fields use empty-string / boolean / numeric defaults.
  tenancy: {
    // Legal clauses appended after the standard contract body.
    additionalTerms: [], // string[]
    // Free-text block for any special conditions agreed between parties.
    specialConditions: '',
    // Maintenance responsibility split (cosmetic/minor = tenant; structural = landlord).
    maintenanceObligation: 'tenant-minor-landlord-major',
    // Sub-letting / sharing permissions.
    subletAllowed: false,
    petsAllowed: false,
    // Utilities included in rent (e.g. "DEWA, District Cooling").
    includedUtilities: '',
    // Ejari registration details (populated after Ejari submission).
    ejariNumber: '',
    ejariRegistrationDate: '',
    // Notice period before early termination or non-renewal (days).
    noticePeriodDays: 90,
    // Grace period allowed for late rental payments (days).
    gracePeriodDays: 5,
    // Handover checklist.
    checklistCompleted: false,
    keyHandoverDate: '',
    // Inspection notes recorded at move-in.
    moveInInspectionNotes: '',
  },
  // ─── Salary Certificate ──────────────────────────────────────────────────
  salaryCertificate: {
    referenceNumber: '',
    issueDate: '',
    issuedTo: '', // e.g. 'Emirates NBD Bank', 'Dubai Immigration'
    validityDays: '30',
    // Employee details
    employeeName: '',
    employeeId: '',
    designation: '',
    department: '',
    joiningDate: '',
    employmentType: 'Full-Time, Permanent',
    nationality: '',
    idType: 'Emirates ID',
    idNumber: '',
    passportNo: '',
    // Salary components (numbers stored as strings to allow empty defaults)
    currency: 'AED',
    basicSalary: '',
    housingAllowance: '',
    transportAllowance: '',
    otherAllowance: '',
    otherAllowanceLabel: 'Other Allowance',
    totalSalary: '', // auto-calculated if blank
    salaryWordAmount: '', // e.g. 'Eight Thousand Five Hundred'
    // Bank / WPS details (optional)
    bankName: '',
    bankAccountNo: '',
    iban: '',
    // Signatory
    hrName: '',
    hrDesignation: 'HR Manager',
  },
  // ─── Standard Tenancy Addendum (RERA Master Config) ──────────────────────
  // Pre-populated when the “addendum” template is selected.
  // Locked defaults (securityDeposit, renewalCharges, maintenanceCap,
  // noticePeriodDays, legalReference) are enforced at the LLM prompt layer.
  addendum: {
    // Original contract reference details
    originalContractRef: '',
    originalContractDate: '',
    effectiveDate: '',
    // ── Fixed financials (LOCKED by Master Addendum Config) ────────────
    securityDeposit: 4000, // AED — fixed, not negotiable
    renewalCharges: 1050, // AED inclusive of VAT — fixed
    // ── Maintenance cap & responsibility split ───────────────────
    maintenanceCap: 1000, // AED threshold
    maintenanceTenantResponsibility: 'Minor repairs and maintenance costs up to AED 1,000.',
    maintenanceLandlordResponsibility: 'All repair and maintenance works exceeding AED 1,000.',
    // ── Landlord mandatory services (array — edit via updateDocumentSection) ─
    landlordServices: [
      'Professional house cleaning and internal painting prior to key handover.',
      'Regular AC servicing and water tank cleaning throughout the tenancy.',
      'Pest control services as required throughout the tenancy.',
    ],
    // ── RERA compliance ────────────────────────────────────────
    noticePeriodDays: 90, // Dubai Law No. 26 of 2007, Article 25
    legalReference: 'Dubai Law No. 26 of 2007 (Real Property Law), as amended.',
    // ── Additional / custom clauses (array — edit via addAddendumClause) ──
    additionalClauses: [], // string[]
    // ── Witness / signatory details ─────────────────────────────
    witnessName: '',
    witnessIdNo: '',
  },
};

const documentSlice = createSlice({
  name: 'document',
  initialState,
  reducers: {
    updateDocumentSection: (state, action) => {
      const { section, values } = action.payload;
      state[section] = {
        ...state[section],
        ...values,
      };

      if (section === 'landlord') {
        state.landlord.name = CANONICAL_LANDLORD_NAME;
      }
    },
    setDocumentValue: (state, action) => {
      const { section, field, value } = action.payload;
      // Guard: section must exist and field must be declared in the initial
      // state tree.  All tenancy sub-fields are now pre-declared in
      // initialState.tenancy so chat-applied updates will always land safely.
      if (!state[section] || !(field in state[section])) return;
      // Landlord name is always locked to the canonical value.
      state[section][field] = section === 'landlord' && field === 'name' ? CANONICAL_LANDLORD_NAME : value;
    },
    // Appends a single clause string to tenancy.additionalTerms (array).
    addTenancyTerm: (state, action) => {
      const clause = typeof action.payload === 'string' ? action.payload.trim() : '';
      if (clause) state.tenancy.additionalTerms.push(clause);
    },
    // Removes a clause by its index.
    removeTenancyTerm: (state, action) => {
      const idx = action.payload;
      if (typeof idx === 'number' && idx >= 0 && idx < state.tenancy.additionalTerms.length) {
        state.tenancy.additionalTerms.splice(idx, 1);
      }
    },
    // Appends a custom clause to addendum.additionalClauses.
    addAddendumClause: (state, action) => {
      const clause = typeof action.payload === 'string' ? action.payload.trim() : '';
      if (clause) state.addendum.additionalClauses.push(clause);
    },
    // Removes an addendum clause by index.
    removeAddendumClause: (state, action) => {
      const idx = action.payload;
      if (typeof idx === 'number' && idx >= 0 && idx < state.addendum.additionalClauses.length) {
        state.addendum.additionalClauses.splice(idx, 1);
      }
    },
  },
});

export const {
  updateDocumentSection,
  setDocumentValue,
  addTenancyTerm,
  removeTenancyTerm,
  addAddendumClause,
  removeAddendumClause,
} = documentSlice.actions;
export default documentSlice.reducer;
