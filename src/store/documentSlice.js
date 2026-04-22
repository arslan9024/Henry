import { createSlice } from '@reduxjs/toolkit';

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
  },
  tenant: {
    fullName: '',
    emiratesId: '',
    contactNo: '',
    occupation: 'UAE Armed Forces (Military Personnel)',
    category: 'government-military',
  },
  landlord: {
    name: 'MUHAMMAD NAEEM MUHAMMAD H K KHAN',
    iban: 'AE030359356491705358002',
    bank: 'First Abu Dhabi Bank (FAB)',
    swift: 'NBADAEAA',
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
    },
    setDocumentValue: (state, action) => {
      const { section, field, value } = action.payload;
      if (state[section] && field in state[section]) {
        state[section][field] = value;
      }
    },
  },
});

export const { updateDocumentSection, setDocumentValue } = documentSlice.actions;
export default documentSlice.reducer;
